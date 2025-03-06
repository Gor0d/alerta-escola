import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { LinearGradient } from 'expo-linear-gradient';

// Configuração inicial de notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  // Estados
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Estados compartilhados
  const [parentStatus, setParentStatus] = useState({ sent: false, time: '' });
  const [teacherStatus, setTeacherStatus] = useState({ ready: false, time: '' });

  // Efeito para permissões
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') Alert.alert('Permissão para notificações negada');
    })();
  }, []);

  // Função de Login (simplificado para demo)
  const handleLogin = () => {
    if (email && password && userRole) {
      setIsLoggedIn(true);
      Alert.alert('Bem-vindo!', `Você entrou como: ${userRole}`);
    } else {
      Alert.alert('Erro', 'Preencha todos os campos e selecione um perfil');
    }
  };

  // Tela de Login
  if (!isLoggedIn) {
    return (
      <LinearGradient
        colors={['#6366f1', '#4338ca']}
        style={styles.loginContainer}
      >
        <View style={styles.loginBox}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
            style={styles.profileImage}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#94a3b8"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <View style={styles.roleSelector}>
            <TouchableOpacity
              style={[styles.roleButton, userRole === 'pai' && styles.selectedRole]}
              onPress={() => setUserRole('pai')}
            >
              <Text style={styles.roleText}>Sou Pai</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleButton, userRole === 'professor' && styles.selectedRole]}
              onPress={() => setUserRole('professor')}
            >
              <Text style={styles.roleText}>Sou Professor</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Entrar</Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={styles.signupText}>Criar nova conta</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  // Interface após login
  return (
    <View style={styles.container}>
      {userRole === 'pai' ? (
        <View style={styles.section}>
          <Text style={styles.title}>Área do Responsável</Text>
          <TouchableOpacity
            style={[styles.button, parentStatus.sent && styles.disabledButton]}
            onPress={async () => {
              const time = new Date().toLocaleTimeString();
              setParentStatus({ sent: true, time });
              
              await Notifications.scheduleNotificationAsync({
                content: {
                  title: "🚗 Alerta de Chegada",
                  body: `Pai chegando às ${time}`,
                },
                trigger: null,
              });
            }}
            disabled={parentStatus.sent}
          >
            <Text style={styles.buttonText}>
              {parentStatus.sent ? `Alerta Enviado (${parentStatus.time})` : "Estou a Caminho!"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.title}>Área do Professor</Text>
          <TouchableOpacity
            style={[styles.button, teacherStatus.ready && styles.disabledButton]}
            onPress={async () => {
              const time = new Date().toLocaleTimeString();
              setTeacherStatus({ ready: true, time });
              
              await Notifications.scheduleNotificationAsync({
                content: {
                  title: "✅ Aluno Pronto",
                  body: `Preparado às ${time}`,
                },
                trigger: null,
              });
            }}
            disabled={teacherStatus.ready}
          >
            <Text style={styles.buttonText}>
              {teacherStatus.ready ? `Confirmado (${teacherStatus.time})` : "Aluno Pronto"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// Estilos atualizados
const styles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 25,
    borderRadius: 20,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 25,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: '#0f172a',
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 15,
  },
  roleButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
  },
  selectedRole: {
    backgroundColor: '#6366f1',
  },
  roleText: {
    color: '#0f172a',
    fontWeight: '500',
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#4f46e5',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  loginButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  signupText: {
    color: '#64748b',
    marginTop: 20,
  },
  // Estilos anteriores mantidos
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    marginVertical: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    color: '#1e293b',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4f46e5',
    padding: 15,
    borderRadius: 10,
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '500',
  },
});