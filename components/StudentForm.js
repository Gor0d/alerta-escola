import React, { useState } from 'react'
import { View, TextInput, Button, Alert } from 'react-native'
import { supabase } from '../services/supabase'

const StudentForm = ({ userId }) => {
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')

  const handleCreateStudent = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .insert([{ name, birth_date: birthDate, parent_id: userId }])
      
      if (error) throw error
      
      Alert.alert('Sucesso', 'Aluno cadastrado!')
      setName('')
      setBirthDate('')
    } catch (error) {
      Alert.alert('Erro', error.message)
    }
  }

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Nome do aluno"
        value={name}
        onChangeText={setName}
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, padding: 5 }}
      />
      
      <TextInput
        placeholder="Data de nascimento (AAAA-MM-DD)"
        value={birthDate}
        onChangeText={setBirthDate}
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, padding: 5 }}
      />
      
      <Button title="Cadastrar Aluno" onPress={handleCreateStudent} />
    </View>
  )
}

export default StudentForm