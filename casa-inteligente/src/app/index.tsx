'use client';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { Button } from 'react-native-paper';
import styles from './styles';

const ESP32_IP = "10.90.43.11";

interface IControlador {
  led1?: boolean,
  led2?: boolean,
  servoporta?: number,
  servojanela?: number
}

export default function Home() {
  const [dados, setDados] = useState<IControlador>({ led1: false, led2: false, servoporta: 0, servojanela: 0 });
  const [status, setStatus] = useState<'conectando' | 'conectado' | 'desconectado'>('conectando');

  let ws: WebSocket;

  function conectar() {
    ws = new WebSocket(`ws://${ESP32_IP}:81/`);

    ws.onopen = () => {
      setStatus('conectado');
    };

    ws.onclose = () => {
      setStatus('desconectado');

      setTimeout(conectar, 3000);
    };

    ws.onerror = (error) => {
      console.log("Erro no WebSocket:", error);
      ws.close();
    };
  }

  function EnviarDados(dados: IControlador) {
    if (status == 'conectado') {
    if (dados.led1 !== undefined && dados.led2 !== undefined) {
      if (dados.led1 !== dados.led2) {
        ws.send(JSON.stringify({ led1: false, led2: false }));
        setDados(prevDados => ({ ...prevDados, led1: false, led2: false }));
      } else {
        ws.send(JSON.stringify({ led1: dados.led1, led2: dados.led2 }));
        setDados(prevDados => ({ ...prevDados, led1: !dados.led1, led2: !dados.led2 }));
      }
    } else {
      if (dados.led1 !== undefined) {
        ws.send(JSON.stringify({ led1: dados.led1 }));
        setDados(prevDados => ({ ...prevDados, led1: !dados.led1 }));
      }
      if (dados.led2 !== undefined) {
        ws.send(JSON.stringify({ led2: dados.led2 }));
        setDados(prevDados => ({ ...prevDados, led2: !dados.led2 }));
      }
    }
    if (dados.servoporta !== undefined) {
      ws.send(JSON.stringify({ servoporta: dados.servoporta }));
      setDados(prevDados => ({ ...prevDados, servoporta: (dados.servoporta === 0 ? 90 : 0) }));
    }
    if (dados.servojanela !== undefined) {
      ws.send(JSON.stringify({ servojanela: dados.servojanela }));
      setDados(prevDados => ({ ...prevDados, servojanela: (dados.servojanela === 0 ? 90 : 0) }));
    }
    } else {
      console.log("WebSocket não está conectado. Não é possível enviar dados.");
    }
  }

  useEffect(() => {

    conectar();

    return () => {
      if (ws) ws.close();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <View style={styles.container}>

        <View style={styles.botaoContainer}>

          <Button style={styles.button} mode="contained" buttonColor="#0c5a78" onPress={() => { EnviarDados({ led1: dados.led1 }) }}>
            Luz do ambiente
          </Button>

          <Button style={styles.button} mode="contained" buttonColor="#0c7840" onPress={() => { EnviarDados({ led2: dados.led2 }) }}>
            Luz do quintal
          </Button>

          <Button style={styles.button} mode="contained" buttonColor="#026960" onPress={() => { EnviarDados({ led1: dados.led1, led2: dados.led2 }) }}>
            Luzes
          </Button>

          <Button style={styles.button} mode="contained" buttonColor="#ab1212" onPress={() => { EnviarDados({ servoporta: dados.servoporta }) }}>
            Porta
          </Button>

          <Button style={styles.button} mode="contained" buttonColor="#7c6005" onPress={() => { EnviarDados({ servojanela: dados.servojanela }) }}>
            Janela
          </Button>

        </View>

      </View>
    </SafeAreaProvider>
  );
}
