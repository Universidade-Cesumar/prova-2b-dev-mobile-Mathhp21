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

  const cadastrarMaterial = async () => {
    if (!nome || !quantidade) {
      alert('Preencha todos os campos');
      return;
    }

    try {
      await axios.post(API, {
        Nome: nome,
        Quantidade: quantidade
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
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5
  },

  botao: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 5,
    marginBottom: 20
  },

  textoBotao: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold'
  },

  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  },
  
  subtitulo: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 10
},
});