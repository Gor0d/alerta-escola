import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase'; // Caminho correto para o seu arquivo supabase.js

export default function StudentManagement({ navigation }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    status: 'Presente' // Status padrão
  });

  // Função para buscar alunos do Supabase
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      // Ajuste a consulta conforme sua estrutura de tabela no Supabase
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      if (data) setStudents(data);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error.message);
      Alert.alert('Erro', 'Não foi possível carregar os alunos');
    } finally {
      setLoading(false);
    }
  };

  // Função para adicionar um novo aluno
  const addStudent = async () => {
    if (!newStudent.name.trim()) {
      Alert.alert('Erro', 'O nome do aluno é obrigatório');
      return;
    }

    try {
      setLoading(true);
      
      // Inserir novo aluno no Supabase
      const { data, error } = await supabase
        .from('students')
        .insert([
          { 
            name: newStudent.name.trim(),
            status: newStudent.status
          }
        ])
        .select();
      
      if (error) throw error;
      
      // Atualizar lista de alunos
      if (data) {
        setStudents([...students, ...data]);
        setNewStudent({ name: '', status: 'Presente' });
        setModalVisible(false);
        Alert.alert('Sucesso', 'Aluno adicionado com sucesso');
      }
    } catch (error) {
      console.error('Erro ao adicionar aluno:', error.message);
      Alert.alert('Erro', 'Não foi possível adicionar o aluno');
    } finally {
      setLoading(false);
    }
  };

  // Função para alternar o status de um aluno (Presente/Ausente)
  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Presente' ? 'Ausente' : 'Presente';
    
    try {
      setLoading(true);
      
      // Atualizar status no Supabase
      const { error } = await supabase
        .from('students')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      // Atualizar lista local
      setStudents(students.map(student => 
        student.id === id ? { ...student, status: newStatus } : student
      ));
    } catch (error) {
      console.error('Erro ao atualizar status:', error.message);
      Alert.alert('Erro', 'Não foi possível atualizar o status do aluno');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('TeacherDashboard')}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gerenciamento de Alunos</Text>
      </View>
      
      <View style={styles.content}>
        {loading ? (
          <Text style={styles.loadingText}>Carregando...</Text>
        ) : (
          <>
            {students.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum aluno cadastrado</Text>
            ) : (
              <FlatList
                data={students}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.studentCard}
                    onPress={() => toggleStatus(item.id, item.status)}
                  >
                    <Text style={styles.studentName}>{item.name}</Text>
                    <View style={[
                      styles.statusBadge, 
                      { backgroundColor: item.status === 'Presente' ? '#4CAF50' : '#F44336' }
                    ]}>
                      <Text style={styles.studentStatus}>{item.status}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </>
        )}
        
        {/* Botão Flutuante para Adicionar Aluno */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Modal para Adicionar Aluno */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Novo Aluno</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nome do Aluno"
              value={newStudent.name}
              onChangeText={(text) => setNewStudent({...newStudent, name: text})}
            />
            
            <View style={styles.statusSelection}>
              <Text style={styles.statusLabel}>Status Inicial:</Text>
              <View style={styles.statusOptions}>
                <TouchableOpacity
                  style={[
                    styles.statusOption,
                    newStudent.status === 'Presente' && styles.selectedStatus
                  ]}
                  onPress={() => setNewStudent({...newStudent, status: 'Presente'})}
                >
                  <Text style={styles.statusOptionText}>Presente</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.statusOption,
                    newStudent.status === 'Ausente' && styles.selectedStatus
                  ]}
                  onPress={() => setNewStudent({...newStudent, status: 'Ausente'})}
                >
                  <Text style={styles.statusOptionText}>Ausente</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setNewStudent({ name: '', status: 'Presente' });
                }}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={addStudent}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Salvando...' : 'Salvar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#344955',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#475569',
  },
  studentCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#344955',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  studentStatus: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#F9AA33',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#344955',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  statusSelection: {
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 16,
    color: '#344955',
    marginBottom: 10,
  },
  statusOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusOption: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  selectedStatus: {
    backgroundColor: '#E6F7FF',
    borderColor: '#1890FF',
  },
  statusOptionText: {
    fontSize: 14,
    color: '#344955',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  saveButton: {
    backgroundColor: '#F9AA33',
  },
  buttonText: {
    fontSize: 16,
    color: '#344955',
    fontWeight: 'bold',
  },
});