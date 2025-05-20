import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
// Removed unused AsyncStorage import
import * as Notifications from 'expo-notifications';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from './services/supabase';

// Importe os componentes da área do professor
import TeacherDashboard from './screens/TeacherDashboard';
import StudentManagement from './screens/StudentManagement';

const { width, height } = Dimensions.get('window');

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
});

export default function App() {
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [activeTab, setActiveTab] = useState('main');
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [userRole, setUserRole] = useState('teacher');
  const [isSignUp, setIsSignUp] = useState(false);
  const [students, setStudents] = useState([]);
  // Removed unused selectedStudent state
  const [chats] = useState([]); // Retained chats for rendering but removed unused setChats
  const [activeChatId] = useState(null); // Retained activeChatId for rendering but removed unused setActiveChatId
  const [messages] = useState([]); // Retained messages for rendering but removed unused setMessages
  const [newMessage, setNewMessage] = useState('');
  const [chatModalVisible, setChatModalVisible] = useState(false);
  // Removed unused parentStatus and setParentStatus state
  // Removed unused teacherStatus and setTeacherStatus state
  const [currentPage, setCurrentPage] = useState(0);
  // Adicione o novo estado para controlar a tela ativa
  const [activeScreen, setActiveScreen] = useState('main');
  
  // Refs
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  console.log('UserRole:', userRole);
console.log('ActiveScreen:', activeScreen);
  
  const onboardingData = [
    {
      id: '1',
      title: 'Bem-vindo ao Alerta Escola',
      description: 'Conectando pais e professores para um melhor acompanhamento escolar',
      image: require('./assets/onboarding1.png')
    },
    {
      id: '2',
      title: 'Comunicação em tempo real',
      description: 'Receba notificações e comunique-se com os professores facilmente',
      image: require('./assets/onboarding2.png')
    },
    {
      id: '3',
      title: 'Facilidade para todos',
      description: 'Interface intuitiva para melhorar a experiência dos pais e professores',
      image: require('./assets/onboarding3.png')
    }
  ];

  const handleEmailLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ // Removed unused data
        email: email,
        password: password,
      });

      if (error) throw error;
    } catch (error) {
      Alert.alert('Erro no login', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLinkLogin = async () => {
    const now = Date.now();

    if (now - lastRequestTime < 60000) {
      Alert.alert("Aguarde", "Tente novamente em alguns instantes.");
      return;
    }

    setLastRequestTime(now);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({ 
        email,
        options: {
          emailRedirectTo: 'alertaescola://login-callback'
        }
      });

      if (error) throw error;
      
      Alert.alert("Verifique seu email", "Um link de acesso foi enviado.");
    } catch (error) {
      Alert.alert("Erro", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !name) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }
    
    try {
      setLoading(true);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: userRole
          }
        }
      });
  
      if (authError) {
        throw authError;
      }
  
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: authData.user.id,
            name,
            email,
            role: userRole,
            created_at: new Date().toISOString()
          }]);
  
        if (profileError) throw profileError;
  
        Alert.alert(
          "Sucesso", 
          "Conta criada com sucesso! Verifique seu email para confirmação."
        );
      }
    } catch (error) {
      console.error('Erro completo:', error);
      Alert.alert(
        "Erro no cadastro", 
        error.message || 'Erro ao criar conta. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      Alert.alert("Erro ao sair", error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddStudent = () => {
    console.log('Adicionando aluno');
  };
  
  const loadUserData = async (user) => {
    console.log('Carregando dados do usuário:', user.id);
    
    try {
      // Buscar o perfil do usuário para determinar a função
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) throw profileError;
      
      if (profileData) {
        setUserRole(profileData.role);
        
        // Se for professor, defina a tela inicial como 'main'
        if (profileData.role === 'teacher') {
          setActiveScreen('main');
        }
      }
      
      // Carregar estudantes (mock para demonstração)
      setStudents([
        { id: '1', name: 'João Silva', status: 'Presente hoje' },
        { id: '2', name: 'Maria Oliveira', status: 'Ausente hoje' },
        { id: '3', name: 'Pedro Santos', status: 'Presente hoje' }
      ]);
      
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  };
  
  const checkIfFirstLaunch = async () => {
    console.log('Verificando primeiro acesso');
  };
  
  const skipOnboarding = () => {
    setShowOnboarding(false);
  };
  
  const goToNextSlide = () => {
    if (currentPage < onboardingData.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentPage + 1 });
      setCurrentPage(currentPage + 1);
    } else {
      setShowOnboarding(false);
    }
  };
  
  const handleSendMessage = () => {
    console.log('Enviar mensagem:', newMessage);
    setNewMessage(''); // Limpar o campo de mensagem após enviar
  };

  // Função de navegação simulada para uso nos componentes
  const navigationProp = {
    navigate: (screen, params = {}) => {
      console.log(`Navegando para ${screen} com parâmetros:`, params);
      
      if (screen === 'TeacherDashboard') {
        setActiveScreen('main');
      } else if (screen === 'StudentManagement') {
        setActiveScreen('studentManagement');
      } else if (screen === 'ChatScreen') {
        setChatModalVisible(true);
      } else if (screen === 'StudentDetail') {
        // Implementar futuramente
        console.log('Navegação para StudentDetail com ID:', params.studentId);
      }
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          await loadUserData(user);
          setShowOnboarding(false);
        } else {
          await checkIfFirstLaunch();
        }
      } catch (error) {
        console.error("Session error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => { // Removed unused event
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user);
        setShowOnboarding(false);
      }
    });

    return () => subscription?.unsubscribe?.();
  }, []);

  const renderOnboardingItem = ({ item }) => (
    <View style={[styles.onboardingSlide, { width }]}>
      <Image source={item.image} style={styles.onboardingImage} resizeMode="contain" />
      <Text style={styles.onboardingTitle}>{item.title}</Text>
      <Text style={styles.onboardingDescription}>{item.description}</Text>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      {onboardingData.map((_, index) => {
        const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [10, 20, 10],
          extrapolate: 'clamp'
        });
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp'
        });

        return (
          <Animated.View
            key={index.toString()}
            style={[styles.paginationDot, { width: dotWidth, opacity }]}
          />
        );
      })}
    </View>
  );

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (showOnboarding) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.skipButton} onPress={skipOnboarding}>
          <Text style={styles.skipButtonText}>Pular</Text>
        </TouchableOpacity>

        <FlatList
          ref={flatListRef}
          data={onboardingData}
          renderItem={renderOnboardingItem}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onMomentumScrollEnd={(e) => {
            const newPage = Math.floor(e.nativeEvent.contentOffset.x / width);
            setCurrentPage(newPage);
          }}
        />

        {renderPagination()}

        <TouchableOpacity style={styles.nextButton} onPress={goToNextSlide}>
          <LinearGradient
            colors={['#6366f1', '#4338ca']}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>
              {currentPage === onboardingData.length - 1 ? 'Começar' : 'Próximo'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  if (!user) {
    return (
      <LinearGradient colors={['#6366f1', '#4338ca']} style={styles.loginContainer}>
        <View style={styles.loginBox}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
            style={styles.profileImage}
          />

          {isSignUp && (
            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              value={name}
              onChangeText={setName}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {isSignUp && (
            <TextInput
              style={styles.input}
              placeholder="Senha"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          )}

          <View style={styles.roleSelector}>
            <TouchableOpacity
              style={[styles.roleButton, userRole === 'parent' && styles.selectedRole]}
              onPress={() => setUserRole('parent')}
            >
              <Text style={[styles.roleText, userRole === 'parent' && styles.selectedRoleText]}>
                Sou Responsável
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleButton, userRole === 'teacher' && styles.selectedRole]}
              onPress={() => setUserRole('teacher')}
            >
              <Text style={[styles.roleText, userRole === 'teacher' && styles.selectedRoleText]}>
                Sou Professor
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={isSignUp ? handleSignUp : handleMagicLinkLogin}
          >
            <Text style={styles.loginButtonText}>
              {isSignUp ? 'Cadastrar' : 'Entrar com Magic Link'}
            </Text>
          </TouchableOpacity>

          {!isSignUp && (
            <TouchableOpacity
              style={styles.secondaryLoginButton}
              onPress={handleEmailLogin}
            >
              <Text style={styles.secondaryLoginButtonText}>
                Entrar com Email e Senha
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
            <Text style={styles.signupText}>
              {isSignUp ? 'Já tem conta? Faça login' : 'Ainda não tem conta? Cadastre-se'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      {activeTab === 'main' ? (
        userRole === 'parent' ? (
          <View style={styles.section}>
            <Text style={styles.title}>Área do Responsável</Text>

            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddStudent}
            >
              <Ionicons name="add" size={24} color="white" />
              <Text style={styles.addButtonText}>Adicionar Aluno</Text>
            </TouchableOpacity>

            <FlatList
              data={students}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.studentCard}
                  onPress={() => setSelectedStudent(item)}
                >
                  <Text style={styles.studentName}>{item.name}</Text>
                  <Text style={styles.studentStatus}>{item.status}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        ) : (
          // Área do professor - agora usando os novos componentes
          activeScreen === 'main' ? (
            <TeacherDashboard navigation={navigationProp} />
          ) : activeScreen === 'studentManagement' ? (
            <StudentManagement navigation={navigationProp} />
          ) : (
            <View style={styles.section}>
              <Text style={styles.title}>Área do Professor</Text>
              <FlatList
                data={students}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.studentCard}
                    onPress={() => setSelectedStudent(item)}
                  >
                    <Text style={styles.studentName}>{item.name}</Text>
                    <Text style={styles.studentStatus}>{item.status}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )
        )
      ) : (
        <View style={styles.section}>
          <Text style={styles.title}>Configurações</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Sair</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => {
            setActiveTab('main');
            setActiveScreen('main');
          }}
        >
          <Ionicons
            name="home"
            size={24}
            color={activeTab === 'main' ? '#6366f1' : '#a1a1aa'}
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'main' && styles.activeTabButtonText,
            ]}
          >
            Principal
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setActiveTab('settings')}
        >
          <Ionicons
            name="settings"
            size={24}
            color={activeTab === 'settings' ? '#6366f1' : '#a1a1aa'}
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'settings' && styles.activeTabButtonText,
            ]}
          >
            Configurações
          </Text>
        </TouchableOpacity>
      </View>

      {renderChatModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  section: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
  },
  // Estilos do onboarding
  onboardingSlide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  onboardingImage: {
    width: width * 0.8,
    height: height * 0.4,
    marginBottom: 20,
  },
  onboardingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 10,
  },
  onboardingDescription: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
  },
  paginationDot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#cbd5e1',
    marginHorizontal: 5,
  },
  skipButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#4f46e5',
  },
  nextButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    zIndex: 1,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  nextButtonText: {
    fontSize: 16,
    color: '#fff',
    marginRight: 5,
  },
  // Estilos de login e signup
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: width * 0.8,
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 5,
    backgroundColor: '#f9fafb',
  },
  roleSelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  roleButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginHorizontal: 5,
  },
  selectedRole: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  roleText: {
    color: '#475569',
  },
  selectedRoleText: {
    color: '#fff',
  },
  loginButton: {
    backgroundColor: '#4f46e5',
    padding: 12,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryLoginButton: {
    backgroundColor: '#e0e7ff',
    padding: 12,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  secondaryLoginButtonText: {
    color: '#4f46e5',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupText: {
    color: '#4f46e5',
  },
  // Estilos da área principal
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4f46e5',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 10,
  },
  studentCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  studentStatus: {
    fontSize: 14,
    color: '#475569',
  },
  // Estilos da barra de abas
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingVertical: 10,
  },
  tabButton: {
    alignItems: 'center',
  },
  tabButtonText: {
    fontSize: 12,
    color: '#a1a1aa',
  },
  activeTabButtonText: {
    color: '#6366f1',
  },
  // Estilos do botão de logout
  logoutButton: {
    backgroundColor: '#dc2626',
    padding: 12,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Estilos do modal de chat
  modalContainer: {
    flex: 1,
    backgroundColor: '#f3f4f6',
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
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 10,
  },
  messagesList: {
    flex: 1,
    padding: 10,
  },
  messageContainer: {
    maxWidth: '80%',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#d1d5db',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e5e7eb',
  },
  messageText: {
    fontSize: 16,
    color: '#1e293b',
  },
  messageTime: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  messageInput: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#f9fafb',
  },
  sendButton: {
    backgroundColor: '#4f46e5',
    padding: 10,
    borderRadius: 8,
  },
});