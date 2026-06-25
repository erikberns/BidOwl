import { WS_URL } from '@/constants/api';
import { getSessionToken } from '@/services/authSession';

export type AuctionRealtimeEvent = {
  tipo: 'NUEVA_PUJA' | 'ERROR' | 'ITEM_FINALIZADO' | 'SUBASTA_CERRADA';
  exito?: boolean;
  mensaje?: string;
  subastaId?: number;
  itemId?: number;
  pujaId?: number;
  asistenteId?: number;
  clienteId?: number;
  numeroPostor?: number;
  nombreCliente?: string;
  importe?: number;
  moneda?: string;
  fechaHora?: string;
  fechaFinPuja?: string;
  estadoItem?: string;
  estadoSubasta?: string;
};

type Listener = (event: AuctionRealtimeEvent) => void;

const NULL_CHAR = '\u0000';

function encodeFrame(command: string, headers: Record<string, string> = {}, body = '') {
  const headerLines = Object.entries(headers).map(([key, value]) => `${key}:${value}`);
  return [command, ...headerLines, '', body].join('\n') + NULL_CHAR;
}

function parseFrames(data: string) {
  return data
    .split(NULL_CHAR)
    .map(frame => frame.trim())
    .filter(Boolean)
    .map(frame => {
      const parts = frame.split('\n\n');
      const headerBlock = parts.shift() || '';
      const body = parts.join('\n\n');
      const [command, ...headerLines] = headerBlock.split('\n');
      const headers: Record<string, string> = {};
      headerLines.forEach(line => {
        const idx = line.indexOf(':');
        if (idx > -1) {
          headers[line.slice(0, idx)] = line.slice(idx + 1);
        }
      });
      return { command, headers, body };
    });
}

export function connectAuctionRealtime(
  subastaId: string,
  itemId: string,
  listener: Listener,
  onError?: (message: string) => void,
) {
  let ws: WebSocket | null = new WebSocket(WS_URL);
  let connected = false;
  let subscriptionId = `subasta-${subastaId}-item-${itemId}`;

  const send = (frame: string) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(frame);
    }
  };

  ws.onopen = () => {
    send(encodeFrame('CONNECT', {
      'accept-version': '1.2',
      'heart-beat': '10000,10000',
    }));
  };

  ws.onmessage = (message) => {
    parseFrames(String(message.data)).forEach(frame => {
      if (frame.command === 'CONNECTED') {
        connected = true;
        send(encodeFrame('SUBSCRIBE', {
          id: subscriptionId,
          destination: `/topic/subasta/${subastaId}/items/${itemId}`,
          ack: 'auto',
        }));
        return;
      }

      if (frame.command === 'MESSAGE' && frame.body) {
        try {
          listener(JSON.parse(frame.body));
        } catch (e) {
          console.error('[auctionRealtime] Error parsing event:', e);
        }
      }

      if (frame.command === 'ERROR') {
        onError?.(frame.body || 'Error de conexion en tiempo real.');
      }
    });
  };

  ws.onerror = () => {
    onError?.('No se pudo conectar al canal en tiempo real.');
  };

  const disconnect = () => {
    if (!ws) return;
    if (connected && ws.readyState === WebSocket.OPEN) {
      send(encodeFrame('UNSUBSCRIBE', { id: subscriptionId }));
      send(encodeFrame('DISCONNECT', { receipt: `bye-${Date.now()}` }));
    }
    ws.close();
    ws = null;
  };

  const sendBid = async (payload: {
    itemId: string | number;
    importe: number;
    idMetodoPago?: string;
    clienteId?: number;
    asistenteId?: number;
  }) => {
    if (!ws || ws.readyState !== WebSocket.OPEN || !connected) {
      return false;
    }
    const tokenSesion = await getSessionToken();
    send(encodeFrame('SEND', {
      destination: `/app/subasta/${subastaId}/pujar`,
      'content-type': 'application/json',
    }, JSON.stringify({
      ...payload,
      tokenSesion,
    })));
    return true;
  };

  return { disconnect, sendBid };
}
