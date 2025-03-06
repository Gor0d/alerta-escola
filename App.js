import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';

// Configuração das notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [parentStatus, setParentStatus] = useState({ sent: false, time: '' });
  const [teacherStatus, setTeacherStatus] = useState({ ready: false, time: '' });

  // Pedir permissão para notificações
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') Alert.alert('Permissão para notificações negada!');
    })();
  }, []);

  // Ação do pai
  const handleParentAlert = async () => {
    const time = new Date().toLocaleTimeString('pt-BR');
    setParentStatus({ sent: true, time });

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🚗 Pai a caminho!',
        body: `Alerta enviado às ${time}`,
        sound: 'default',
      },
      trigger: null,
    });
  };

  // Ação do professor
  const handleTeacherConfirmation = async () => {
    const time = new Date().toLocaleTimeString('pt-BR');
    setTeacherStatus({ ready: true, time });

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '✅ Aluno pronto',
        body: `Aluno preparado às ${time}`,
        sound: 'default',
      },
      trigger: null,
    });
  };

  return (
    <View style={styles.container}>
      {/* Seção Pai */}
      <View style={styles.section}>
        <Text style={styles.title}>Responsável</Text>
        <Button
          title="Enviar Alerta de Chegada"
          onPress={handleParentAlert}
          color="#4CAF50"
          disabled={parentStatus.sent}
        />
        {parentStatus.sent && (
          <Text style={styles.status}>Enviado às {parentStatus.time}</Text>
        )}
      </View>

      {/* Seção Professor */}
      <View style={styles.section}>
        <Text style={styles.title}>Professor</Text>
        <Button
          title="Confirmar Preparação"
          onPress={handleTeacherConfirmation}
          color="#2196F3"
          disabled={teacherStatus.ready}
        />
        {teacherStatus.ready && (
          <Text style={styles.status}>Confirmado às {teacherStatus.time}</Text>
        )}
      </View>
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F0F4F8',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginVertical: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 15,
    color: '#1A237E',
    textAlign: 'center',
  },
  status: {
    marginTop: 10,
    color: '#757575',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});