import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase'; // Caminho correto para o seu arquivo supabase.js

export default function TeacherDashboard({ navigation }) {
  // Funções e lógica do TeacherDashboard

  // Função para navegar para o gerenciamento de alunos
  const navigateToStudentManagement = () => {
    navigation.navigate('StudentManagement');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard do Professor</Text>
      </View>
      
      <View style={styles.content}>
        {/* Cards de Opções/Funcionalidades */}
        <View style={styles.cardsContainer}>
          <TouchableOpacity 
            style={styles.card}
            onPress={navigateToStudentManagement}
          >
            <Ionicons name="people" size={32} color="#344955" />
            <Text style={styles.cardTitle}>Gerenciar Alunos</Text>
            <Text style={styles.cardDescription}>
              Adicionar e gerenciar lista de presença dos alunos
            </Text>
          </TouchableOpacity>
          
          {/* Outros cards de funcionalidades aqui */}
          <TouchableOpacity 
            style={styles.card}
          >
            <Ionicons name="calendar" size={32} color="#344955" />
            <Text style={styles.cardTitle}>Aulas</Text>
            <Text style={styles.cardDescription}>
              Planejamento de aulas e atividades
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#344955',
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#344955',
    marginTop: 10,
  },
  cardDescription: {
    fontSize: 12,
    color: '#475569',
    marginTop: 5,
  },
});