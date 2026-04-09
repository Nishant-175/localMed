import { useContext } from 'react';
import { SocketContext } from '../context/SocketContext';

export function useSocket() {
  const { socket } = useContext(SocketContext);

  const emit = (event, data) => {
    if (socket) {
      socket.emit(event, data);
    }
  };

  const on = (event, callback) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  const off = (event) => {
    if (socket) {
      socket.off(event);
    }
  };

  return { socket, emit, on, off };
}
