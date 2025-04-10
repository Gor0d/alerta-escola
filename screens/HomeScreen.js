import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, Button } from 'react-native'
import { supabase } from '../services/supabase'
import StudentForm from '../components/StudentForm'

const HomeScreen = ({ userId }) => {
  const [students, setStudents] = useState([])
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const fetchStudents = async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('parent_id', userId)
      
      if (!error) setStudents(data)
    }

    fetchStudents()
  }, [userId])

  return (
    <View style={{ flex: 1 }}>
      <Button
        title={showForm ? "Fechar Formulário" : "Adicionar Aluno"}
        onPress={() => setShowForm(!showForm)}
      />
      
      {showForm && <StudentForm userId={userId} />}
      
      <FlatList
        data={students}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderBottomWidth: 1 }}>
            <Text>Nome: {item.name}</Text>
            <Text>Nascimento: {item.birth_date}</Text>
          </View>
        )}
      />
    </View>
  )
}

export default HomeScreen