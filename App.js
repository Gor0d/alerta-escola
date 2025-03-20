import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  Alert,
  ScrollView,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Configuração inicial de notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Dados mockados para o dashboard
const MOCK_STUDENTS = [
  { id: '1', name: 'Maria Silva', class: '3º Ano A', parentName: 'João Silva', status: 'Na escola' },
  { id: '2', name: 'Pedro Santos', class: '3º Ano A', parentName: 'Ana Santos', status: 'A caminho' },
  { id: '3', name: 'Lucas Ferreira', class: '3º Ano A', parentName: 'Roberto Ferreira', status: 'Saída confirmada' },
  { id: '4', name: 'Julia Mendes', class: '3º Ano A', parentName: 'Carla Mendes', status: 'Na escola' },
  { id: '5', name: 'Sophia Oliveira', class: '3º Ano A', parentName: 'Marcos Oliveira', status: 'Ausente' },
];

// Mensagens mockadas para o chat
const INITIAL_MESSAGES = [
  { id: '1', sender: 'professor', text: 'Olá! Tudo bem?', time: '09:00' },
  { id: '2', sender: 'pai', text: 'Tudo ótimo! Como está meu filho hoje?', time: '09:05' },
  { id: '3', sender: 'professor', text: 'Ele está muito bem! Participou bastante da aula de matemática.', time: '09:10' },
];

export default function App() {
  // Estados
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('main');
  
  // Estados para o Dashboard
  const [students, setStudents] = useState(MOCK_STUDENTS);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Estados para o Chat
  const [chats, setChats] = useState([
    { id: '1', name: 'João Silva (Pai de Maria)', lastMessage: 'Ele está muito bem!', time: '09:10', unread: 0 },
    { id: '2', name: 'Ana Santos (Mãe de Pedro)', lastMessage: 'Pode mandar a lição de casa?', time: '08:45', unread: 2 },
    { id: '3', name: 'Prof. Mariana (3º Ano B)', lastMessage: 'Vamos planejar a feira de ciências', time: 'Ontem', unread: 0 },
  ]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [chatModalVisible, setChatModalVisible] = useState(false);

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

  // Função para enviar mensagem
  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: Date.now().toString(),
      sender: userRole, // 'pai' ou 'professor'
      text: newMessage.trim(),
      time: currentTime,
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage('');
    
    // Atualizar o último estado da mensagem na lista de chats
    const updatedChats = chats.map(chat => {
      if (chat.id === activeChatId) {
        return {
          ...chat,
          lastMessage: newMessage.trim(),
          time: currentTime,
          unread: 0,
        };
      }
      return chat;
    });
    
    setChats(updatedChats);
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
              <Text style={[styles.roleText, userRole === 'pai' && styles.selectedRoleText]}>Sou Pai</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleButton, userRole === 'professor' && styles.selectedRole]}
              onPress={() => setUserRole('professor')}
            >
              <Text style={[styles.roleText, userRole === 'professor' && styles.selectedRoleText]}>Sou Professor</Text>
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

  // Chat Modal
  const renderChatModal = () => (
    <Modal
      animationType="slide"
      transparent={false}
      visible={chatModalVisible}
      onRequestClose={() => setChatModalVisible(false)}
    >
      <KeyboardAvoidingView 
        style={styles.modalContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 85 : 0}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setChatModalVisible(false)}>
            <Ionicons name="arrow-back" size={24} color="#4f46e5" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {chats.find(chat => chat.id === activeChatId)?.name || 'Chat'}
          </Text>
        </View>
        
        <FlatList
          data={messages}
          keyExtractor={item => item.id}
          style={styles.messagesList}
          renderItem={({ item }) => (
            <View style={[
              styles.messageContainer,
              item.sender === userRole ? styles.sentMessage : styles.receivedMessage
            ]}>
              <Text style={styles.messageText}>{item.text}</Text>
              <Text style={styles.messageTime}>{item.time}</Text>
            </View>
          )}
        />
        
        <View style={styles.messageInputContainer}>
          <TextInput
            style={styles.messageInput}
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Ionicons name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  // Interface principal após login
  return (
    <View style={styles.container}>
      {/* Conteúdo principal baseado na aba ativa */}
      {activeTab === 'main' ? (
        // Tela Principal
        userRole === 'pai' ? (
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
          // Dashboard do Professor
          <View style={styles.section}>
            <Text style={styles.title}>Dashboard do Professor</Text>
            <Text style={styles.subtitle}>Lista de Alunos</Text>
            
            <FlatList
              data={students}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.studentCard}
                  onPress={() => setSelectedStudent(item)}
                >
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>{item.name}</Text>
                    <Text style={styles.studentClass}>{item.class}</Text>
                  </View>
                  <View style={styles.studentStatusContainer}>
                    <Text style={[
                      styles.studentStatus,
                      item.status === 'A caminho' ? styles.statusComing : 
                      item.status === 'Na escola' ? styles.statusPresent :
                      item.status === 'Saída confirmada' ? styles.statusConfirmed :
                      styles.statusAbsent
                    ]}>
                      {item.status}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
            
            {selectedStudent && (
              <View style={styles.studentDetail}>
                <View style={styles.studentDetailHeader}>
                  <Text style={styles.studentDetailName}>{selectedStudent.name}</Text>
                  <TouchableOpacity onPress={() => setSelectedStudent(null)}>
                    <Ionicons name="close" size={24} color="#64748b" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.studentDetailInfo}>
                  <Text style={styles.studentDetailLabel}>Responsável:</Text>
                  <Text style={styles.studentDetailValue}>{selectedStudent.parentName}</Text>
                </View>
                
                <View style={styles.studentDetailInfo}>
                  <Text style={styles.studentDetailLabel}>Turma:</Text>
                  <Text style={styles.studentDetailValue}>{selectedStudent.class}</Text>
                </View>
                
                <View style={styles.studentDetailInfo}>
                  <Text style={styles.studentDetailLabel}>Status:</Text>
                  <Text style={[
                    styles.studentDetailValue,
                    selectedStudent.status === 'A caminho' ? styles.textComing : 
                    selectedStudent.status === 'Na escola' ? styles.textPresent :
                    selectedStudent.status === 'Saída confirmada' ? styles.textConfirmed :
                    styles.textAbsent
                  ]}>
                    {selectedStudent.status}
                  </Text>
                </View>
                
                <TouchableOpacity
                  style={[styles.button, teacherStatus.ready && styles.disabledButton]}
                  onPress={async () => {
                    const time = new Date().toLocaleTimeString();
                    setTeacherStatus({ ready: true, time });
                    
                    await Notifications.scheduleNotificationAsync({
                      content: {
                        title: "✅ Aluno Pronto",
                        body: `${selectedStudent.name} preparado às ${time}`,
                      },
                      trigger: null,
                    });
                    
                    // Atualizar status do aluno
                    setStudents(students.map(student => 
                      student.id === selectedStudent.id 
                        ? {...student, status: 'Saída confirmada'} 
                        : student
                    ));
                    
                    setSelectedStudent({...selectedStudent, status: 'Saída confirmada'});
                  }}
                  disabled={teacherStatus.ready}
                >
                  <Text style={styles.buttonText}>
                    {teacherStatus.ready ? `Confirmado (${teacherStatus.time})` : "Aluno Pronto para Saída"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )
      ) : (
        // Tela de Chat
        <View style={styles.section}>
          <Text style={styles.title}>Mensagens</Text>
          {chats.length > 0 ? (
            <FlatList
              data={chats}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.chatItem}
                  onPress={() => {
                    setActiveChatId(item.id);
                    setChatModalVisible(true);
                  }}
                >
                  <View style={styles.chatItemContent}>
                    <Text style={styles.chatName}>{item.name}</Text>
                    <Text style={styles.chatLastMessage} numberOfLines={1}>
                      {item.lastMessage}
                    </Text>
                  </View>
                  <View style={styles.chatItemMeta}>
                    <Text style={styles.chatTime}>{item.time}</Text>
                    {item.unread > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{item.unread}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              )}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubble-ellipses-outline" size={48} color="#94a3b8" />
              <Text style={styles.emptyStateText}>Nenhuma conversa ainda</Text>
            </View>
          )}
        </View>
      )}
      
      {/* Chat Modal */}
      {renderChatModal()}
      
      {/* Barra de navegação */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'main' && styles.activeTab]} 
          onPress={() => setActiveTab('main')}
        >
          <Ionicons 
            name={userRole === 'pai' ? "car-outline" : "school-outline"} 
            size={24} 
            color={activeTab === 'main' ? "#4f46e5" : "#64748b"} 
          />
          <Text style={[styles.tabText, activeTab === 'main' && styles.activeTabText]}>
            {userRole === 'pai' ? 'Chegada' : 'Dashboard'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'chat' && styles.activeTab]} 
          onPress={() => setActiveTab('chat')}
        >
          <Ionicons 
            name="chatbubbles-outline" 
            size={24} 
            color={activeTab === 'chat' ? "#4f46e5" : "#64748b"} 
          />
          <Text style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>
            Mensagens
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  // Estilos mantidos do original
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
  selectedRoleText: {
    color: 'white',
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
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  section: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 60, // Espaço para a barra de navegação
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
  
  // Novos estilos para o Dashboard
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 10,
    color: '#334155',
  },
  studentCard: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 4,
  },
  studentClass: {
    fontSize: 14,
    color: '#64748b',
  },
  studentStatusContainer: {
    paddingHorizontal: 10,
  },
  studentStatus: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statusPresent: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  statusComing: {
    backgroundColor: '#ffedd5',
    color: '#9a3412',
  },
  statusConfirmed: {
    backgroundColor: '#e0e7ff',
    color: '#3730a3',
  },
  statusAbsent: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
  },
  studentDetail: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  studentDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  studentDetailName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  studentDetailInfo: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  studentDetailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    width: 100,
  },
  studentDetailValue: {
    fontSize: 14,
    color: '#1e293b',
    flex: 1,
  },
  textPresent: {
    color: '#166534',
  },
  textComing: {
    color: '#9a3412',
  },
  textConfirmed: {
    color: '#3730a3',
  },
  textAbsent: {
    color: '#b91c1c',
  },
  
  // Estilos para barra de navegação
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    borderTopWidth: 2,
    borderTopColor: '#4f46e5',
  },
  tabText: {
    fontSize: 12,
    marginTop: 2,
    color: '#64748b',
  },
  activeTabText: {
    color: '#4f46e5',
  },
  
  // Estilos para o Chat
  chatItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  chatItemContent: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 4,
  },
  chatLastMessage: {
    fontSize: 14,
    color: '#64748b',
  },
  chatItemMeta: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
  },
  chatTime: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 5,
  },
  unreadBadge: {
    backgroundColor: '#4f46e5',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    marginTop: 10,
    fontSize: 16,
    color: '#94a3b8',
  },
  
  // Estilos para o Chat Modal
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 15,
    color: '#1e293b',
  },
  messagesList: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f8fafc',
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4f46e5',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e2e8f0',
  },
  messageText: {
    fontSize: 16,
    color: 'white',
  },
  messageTime: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  messageInputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: 'white',
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#4f46e5',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});