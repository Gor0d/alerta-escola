// components/AuthForm.js
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { supabase } from '../services/supabase';

const AuthForm = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState('parent'); // 'parent' ou 'teacher'

  const handleAuth = async () => {
    try {
      if (!email || !password) {
        throw new Error('Preencha todos os campos obrigatórios');
      }

      if (isSignUp && !name) {
        throw new Error('Nome é obrigatório para cadastro');
      }

      if (isSignUp) {
        // Cadastro de novo usuário
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              role
            }
          }
        });

        if (error) throw error;
        
        if (data.user) {
          Alert.alert('Sucesso', 'Cadastro realizado com sucesso! Verifique seu email');
          onAuthSuccess(data.user);
        }
      } else {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;
        onAuthSuccess(data.user);
      }
    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <View style={styles.container}>
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

      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {isSignUp && (
        <View style={styles.roleSelector}>
          <TouchableOpacity
            style={[styles.roleButton, role === 'parent' && styles.selectedRole]}
            onPress={() => setRole('parent')}
          >
            <Text style={role === 'parent' ? styles.selectedRoleText : styles.roleText}>
              Sou Responsável
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleButton, role === 'teacher' && styles.selectedRole]}
            onPress={() => setRole('teacher')}
          >
            <Text style={role === 'teacher' ? styles.selectedRoleText : styles.roleText}>
              Sou Professor
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.authButton} onPress={handleAuth}>
        <Text style={styles.buttonText}>
          {isSignUp ? 'Cadastrar' : 'Entrar'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
        <Text style={styles.toggleText}>
          {isSignUp 
            ? 'Já tem conta? Faça login' 
            : 'Ainda não tem conta? Cadastre-se'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 20,
  },
  input: {
    height: 50,
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: 'white',
  },
  roleSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selectedRole: {
    backgroundColor: '#6366f1',
  },
  roleText: {
    color: '#64748b',
  },
  selectedRoleText: {
    color: 'white',
  },
  authButton: {
    backgroundColor: '#4f46e5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  toggleText: {
    color: '#64748b',
    textAlign: 'center',
    marginTop: 15,
  },
});

export default AuthForm;