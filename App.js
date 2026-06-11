import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList
} from 'react-native';
import axios from 'axios';

const API = 'https://6a2b3936b687a7d5cbc4f9a4.mockapi.io/Materiais';

export default function App() {

  // Estados utilizados para controlar os dados da aplicação
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [materiais, setMateriais] = useState([]);

  useEffect(() => {
    carregarMateriais();
  }, []);

  const carregarMateriais = async () => {
    try {
      const response = await axios.get(API);
      setMateriais(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Função responsável por cadastrar materiais na API
  const cadastrarMaterial = async () => {
    if (nome.trim() === '' || quantidade.trim() === '') {
  alert('Informe o nome e a quantidade do material');
  return;
}

    try {
      await axios.post(API, {
  Nome: nome.trim(),
  Quantidade: quantidade.trim()
});

      setNome('');
      setQuantidade('');

      carregarMateriais();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Almoxarifado - Enfermagem</Text>

      <TextInput
        testID="input-nome"
        style={styles.input}
        placeholder="Nome do Material"
        value={nome}
        onChangeText={setNome}
      />

      <TextInput
        testID="input-quantidade"
        style={styles.input}
        placeholder="Quantidade"
        value={quantidade}
        onChangeText={setQuantidade}
        keyboardType="numeric"
      />

      <TouchableOpacity
        testID="btn-cadastrar"
        style={styles.botao}
        onPress={cadastrarMaterial}
      >
        <Text style={styles.textoBotao}>Cadastrar</Text>
      </TouchableOpacity>

<Text style={styles.subtitulo}>Estoque Atual</Text>

<Text>Total de materiais: {materiais.length}</Text>

{materiais.length === 0 && (
  <Text>Nenhum material cadastrado.</Text>
)}

      <FlatList
        testID="lista-materiais"
        data={materiais}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>
              {item.Nome} - {item.Quantidade}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 40
  },

  title: {
  fontSize: 24,
  fontWeight: 'bold',
  marginBottom: 20,
  textAlign: 'center',
  color: '#007bff'
},

  input: {
  borderWidth: 1,
  borderColor: '#999',
  padding: 12,
  marginBottom: 12,
  borderRadius: 8
},

  botao: {
  backgroundColor: '#28a745',
  padding: 12,
  borderRadius: 8,
  marginBottom: 20
},

  textoBotao: {
  color: '#fff',
  textAlign: 'center',
  fontWeight: 'bold',
  fontSize: 16
},

  item: {
  padding: 15,
  borderBottomWidth: 1,
  borderBottomColor: '#ddd',
  backgroundColor: '#f5f5f5',
  marginBottom: 10,
  borderRadius: 5
},

  subtitulo: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 10
},
});