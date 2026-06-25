import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert
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
  const [busca, setBusca] = useState('');

  useEffect(() => {
    carregarMateriais();
  }, []);

  const carregarMateriais = async () => {
    try {
      const response = await axios.get(API);
      setMateriais(response.data);
    } catch (error) {
      Alert.alert(
        'Erro',
        'Não foi possível carregar os materiais.'
      );
    }
  };

  const cadastrarMaterial = async () => {
    if (nome.trim() === '' || quantidade.trim() === '') {
      Alert.alert(
        'Atenção',
        'Informe o nome e a quantidade do material.'
      );
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
      Alert.alert(
        'Erro',
        'Falha ao cadastrar material.'
      );
    }
  };

  const excluirMaterial = async (id) => {
    try {
      await axios.delete(`${API}/${id}`);

      setMateriais((listaAtual) =>
        listaAtual.filter((item) => item.id !== id)
      );
    } catch (error) {
      Alert.alert(
        'Erro',
        'Falha ao excluir material.'
      );
    }
  };

  const baixarEstoque = async (item) => {
    try {
      const quantidadeRetirada = Number(retirada[item.id] || 0);
      const estoqueAtual = Number(item.Quantidade);

      if (!validarRetirada(estoqueAtual, quantidadeRetirada)) {
        Alert.alert(
          'Atenção',
          'Não é possível retirar mais itens do que existem em estoque.'
        );
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
      Alert.alert(
        'Erro',
        'Falha ao atualizar o estoque.'
      );
    }
  };

  const materiaisFiltrados = materiais.filter((item) =>
    item.Nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏥 SysAlmox</Text>
        <Text style={styles.subtitle}>
          Controle de materiais hospitalares
        </Text>
      </View>

      <TextInput
        testID="input-nome"
        style={styles.input}
        placeholder="Nome do material"
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
        <Text style={styles.textoBotao}>
          Cadastrar Material
        </Text>
      </TouchableOpacity>

      <View style={styles.dashboard}>
        <Text
          testID="total-itens"
          style={styles.dashboardNumero}
        >
          {materiaisFiltrados.length}
        </Text>

        <Text style={styles.dashboardTexto}>
          Materiais cadastrados
        </Text>
      </View>

      <Text style={styles.subtitulo}>
        Estoque Atual
      </Text>

      <TextInput
        testID="input-busca"
        style={styles.input}
        placeholder="🔍 Pesquisar material"
        value={busca}
        onChangeText={setBusca}
      />

      {materiais.length === 0 && (
        <Text style={styles.semDados}>
          Nenhum material cadastrado.
        </Text>
      )}

      <FlatList
        testID="lista-materiais"
        data={materiaisFiltrados}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View
            style={[
              styles.item,
              Number(item.Quantidade) < 10 &&
                styles.estoqueCritico
            ]}
            accessibilityLabel={
              Number(item.Quantidade) < 10
                ? 'estoque-critico'
                : undefined
            }
          >
            <Text style={styles.nomeMaterial}>
              {item.Nome}
            </Text>

            <Text style={styles.quantidadeTexto}>
              Estoque: {item.Quantidade} unidades
            </Text>

            <TextInput
              testID="input-retirada"
              style={styles.input}
              placeholder="Quantidade para retirada"
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
                Excluir Material
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
    paddingTop: 50,
    backgroundColor: '#eef3f8'
  },

  header: {
    alignItems: 'center',
    marginBottom: 20
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#007bff'
  },

  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },

  dashboard: {
    backgroundColor: '#007bff',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 12
  },

  dashboardNumero: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold'
  },

  dashboardTexto: {
    color: '#fff',
    fontSize: 14
  },

  subtitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },

  input: {
    borderWidth: 1,
    borderColor: '#d0d7de',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 12,
    borderRadius: 10
  },

  botao: {
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 10,
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
    fontWeight: 'bold'
  },

  item: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3
  },

  estoqueCritico: {
    backgroundColor: '#fff0f0',
    borderLeftWidth: 6,
    borderLeftColor: '#dc3545'
  },

  nomeMaterial: {
    fontSize: 18,
    fontWeight: 'bold'
  },

  quantidadeTexto: {
    marginTop: 5,
    marginBottom: 10,
    color: '#555'
  },

  semDados: {
    textAlign: 'center',
    marginTop: 10,
    color: '#666'
  }
});