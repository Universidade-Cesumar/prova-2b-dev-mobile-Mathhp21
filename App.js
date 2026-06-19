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

export function validarRetirada(estoqueAtual, quantidadeRetirada) {
  const estoque = Number(estoqueAtual);
  const retirada = Number(quantidadeRetirada);

  if (retirada <= 0) return false;
  if (retirada > estoque) return false;

  return true;
}

export default function App() {
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [materiais, setMateriais] = useState([]);
  const [retirada, setRetirada] = useState({});

  useEffect(() => {
    carregarMateriais();
  }, []);

  
  // Carrega todos os materiais cadastrados na API
const carregarMateriais = async () => {
    try {
      const response = await axios.get(API);
      setMateriais(response.data);
    } catch (error) {
      console.log(error);
    }
  };

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

  const excluirMaterial = async (id) => {
    try {
      await axios.delete(`${API}/${id}`);

      setMateriais((listaAtual) =>
        listaAtual.filter((item) => item.id !== id)
      );
    } catch (error) {
      console.log(error);
    }
  };

  const baixarEstoque = async (item) => {
    try {
      const quantidadeRetirada = Number(retirada[item.id] || 0);
      const estoqueAtual = Number(item.Quantidade);

      if (!validarRetirada(estoqueAtual, quantidadeRetirada)) {
        alert('Não é possível retirar mais itens do que existem em estoque.');
        return;
      }

      const novoEstoque = estoqueAtual - quantidadeRetirada;

      await axios.put(`${API}/${item.id}`, {
        Nome: item.Nome,
        Quantidade: novoEstoque.toString()
      });

      setRetirada({
        ...retirada,
        [item.id]: ''
      });

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
        placeholder="Digite o nome do material"
        value={nome}
        onChangeText={setNome}
      />

      <TextInput
        testID="input-quantidade"
        style={styles.input}
        placeholder="Digite a quantidade"
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
            <Text style={styles.nomeMaterial}>
              {item.Nome} - Estoque: {item.Quantidade}
            </Text>

            <TextInput
              testID="input-retirada"
              style={styles.input}
              placeholder="Informe a quantidade para retirada"
              keyboardType="numeric"
              value={retirada[item.id] || ''}
              onChangeText={(texto) =>
                setRetirada({
                  ...retirada,
                  [item.id]: texto
                })
              }
            />

            <TouchableOpacity
              testID="btn-baixar"
              style={[styles.botao, styles.botaoBaixar]}
              onPress={() => baixarEstoque(item)}
            >
              <Text style={styles.textoBotao}>
                Baixar Estoque
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID="btn-excluir"
              style={[styles.botao, styles.botaoExcluir]}
              onPress={() => excluirMaterial(item.id)}
            >
              <Text style={styles.textoBotao}>
                Excluir
              </Text>
            </TouchableOpacity>
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

  subtitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
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
    marginBottom: 10
  },

  botaoBaixar: {
    backgroundColor: '#ff9800'
  },

  botaoExcluir: {
    backgroundColor: '#dc3545'
  },

  textoBotao: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16
  },

  item: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
    marginBottom: 15,
    borderRadius: 8
  },

  nomeMaterial: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10
  }
});