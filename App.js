import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Platform, View, Text, TextInput, TouchableOpacity,
  FlatList, ActivityIndicator, StatusBar, SafeAreaView, RefreshControl, Alert
} from 'react-native';
import axios from 'axios';

// ─── Constantes ───────────────────────────────────────────────────────────────
const API = 'https://6a2b3936b687a7d5cbc4f9a4.mockapi.io/Materiais';
const LIMITE_CRITICO = 10;

// ─── Utilitário exportado para testes ─────────────────────────────────────────
export function validarRetirada(estoqueAtual, quantidadeRetirada) {
  const estoque = Number(estoqueAtual);
  const retirada = Number(quantidadeRetirada);
  if (isNaN(retirada) || isNaN(estoque)) return false;
  if (retirada <= 0) return false;
  if (retirada > estoque) return false;
  return true;
}

// ─── Componente: Badge de status ──────────────────────────────────────────────
function EstoqueBadge({ quantidade }) {
  const critico = Number(quantidade) < LIMITE_CRITICO;
  return (
    <View style={[styles.badge, critico ? styles.badgeCritico : styles.badgeOk]}>
      <Text style={styles.badgeTexto}>{critico ? '⚠ Crítico' : '✓ Normal'}</Text>
    </View>
  );
}

// ─── Componente: Card de material ─────────────────────────────────────────────
function MaterialCard({ item, retiradaValor, onChangeRetirada, onBaixar, onExcluir }) {
  const qtd = Number(item.Quantidade);
  const critico = qtd < LIMITE_CRITICO;

  const confirmarExclusao = () => {
  console.log('>>> clicou excluir, id:', item.id);
  if (typeof window !== 'undefined' && window.confirm) {
    // web
    if (window.confirm(`Tem certeza que deseja excluir "${item.Nome}"?`)) {
      onExcluir();
    }
  } else {
    // celular
    Alert.alert(
      'Excluir material',
      `Tem certeza que deseja excluir "${item.Nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: onExcluir },
      ]
    );
  }
};

  return (
    <View
      style={[styles.card, critico && styles.estoqueCritico]}
      accessibilityLabel={critico ? 'estoque-critico' : undefined}
      accessible={false}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.nomeMaterial} numberOfLines={1}>{item.Nome}</Text>
        <EstoqueBadge quantidade={item.Quantidade} />
      </View>

      <View style={styles.quantidadeContainer}>
        <Text style={styles.quantidadeNumero}>{item.Quantidade}</Text>
        <Text style={styles.quantidadeLabel}>unidades em estoque</Text>
      </View>

      <View style={styles.barraFundo}>
        <View style={[styles.barraProgresso, { width: `${Math.min(qtd, 100)}%` }, critico ? styles.barraCritica : styles.barraOk]} />
      </View>

      <Text style={styles.labelSecao}>Retirar do estoque</Text>
      <View style={styles.retiradaRow}>
        <TextInput
          testID="input-retirada"
          style={styles.inputRetirada}
          placeholder="Quantidade"
          keyboardType="numeric"
          value={retiradaValor}
          onChangeText={onChangeRetirada}
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity testID="btn-baixar" style={styles.btnBaixar} onPress={onBaixar} activeOpacity={0.8}>
          <Text style={styles.btnTexto}>Baixar</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity testID="btn-excluir" style={styles.btnExcluir} onPress={confirmarExclusao} activeOpacity={0.8}>
        <Text style={styles.btnExcluirTexto}>🗑 Excluir</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────
export default function App() {
  const [nome, setNome]               = useState('');
  const [quantidade, setQuantidade]   = useState('');
  const [materiais, setMateriais]     = useState([]);
  const [retirada, setRetirada]       = useState({});
  const [busca, setBusca]             = useState('');
  const [carregando, setCarregando]   = useState(false);
  const [salvando, setSalvando]       = useState(false);
  const [refreshing, setRefreshing]   = useState(false);

  useEffect(() => { carregarMateriais(); }, []);

  const carregarMateriais = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setCarregando(true);
    try {
      const { data } = await axios.get(API, { timeout: 8000 });
      setMateriais(data);
    } catch {
      Alert.alert('Erro de conexão', 'Não foi possível carregar os materiais. Verifique sua internet.');
    } finally {
      setCarregando(false);
      setRefreshing(false);
    }
  }, []);

  const cadastrarMaterial = async () => {
    if (!nome.trim() || !quantidade.trim()) return Alert.alert('Campos obrigatórios', 'Informe nome e quantidade.');
    if (isNaN(Number(quantidade)) || Number(quantidade) <= 0) return Alert.alert('Quantidade inválida', 'Informe um número maior que zero.');
    setSalvando(true);
    try {
      await axios.post(API, { Nome: nome.trim(), Quantidade: quantidade.trim() }, { timeout: 8000 });
      setNome(''); setQuantidade('');
      await carregarMateriais();
    } catch {
      Alert.alert('Erro ao cadastrar', 'Não foi possível cadastrar o material.');
    } finally { setSalvando(false); }
  };

  const excluirMaterial = async (id) => {
  console.log('>>> excluirMaterial chamada, id:', id); // adicione essa linha
  try {
    const response = await axios.delete(`${API}/${id}`, { timeout: 8000 });
    console.log('>>> resposta da API:', response.status); // e essa
    setMateriais((lista) => lista.filter((i) => i.id !== id));
  } catch (error) {
    console.log('>>> ERRO:', error?.response?.status, error?.message); // e essa
    Alert.alert('Erro ao excluir', `Erro ${error?.response?.status}: ${error?.message}`);
  }
};

  const baixarEstoque = async (item) => {
    const qtdRetirada = Number(retirada[item.id] || 0);
    if (!validarRetirada(item.Quantidade, qtdRetirada)) {
      return Alert.alert('Retirada inválida',
        qtdRetirada <= 0 ? 'Informe uma quantidade maior que zero.' : `Estoque insuficiente. Disponível: ${item.Quantidade}.`
      );
    }
    try {
      const novoEstoque = Number(item.Quantidade) - qtdRetirada;
      await axios.put(`${API}/${item.id}`, { Nome: item.Nome, Quantidade: String(novoEstoque) }, { timeout: 8000 });
      setRetirada((r) => ({ ...r, [item.id]: '' }));
      await carregarMateriais();
    } catch {
      Alert.alert('Erro ao atualizar', 'Não foi possível atualizar o estoque.');
    }
  };

  const filtrados = materiais.filter((i) => i.Nome.toLowerCase().includes(busca.toLowerCase()));
  const criticos  = filtrados.filter((i) => Number(i.Quantidade) < LIMITE_CRITICO).length;
  const normais   = filtrados.length - criticos;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0d6efd" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Almoxarifado</Text>
        <Text style={styles.headerSub}>Enfermagem • Controle de Estoque</Text>
      </View>

      <FlatList
        testID="lista-materiais"
        data={filtrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => carregarMateriais(true)} colors={['#0d6efd']} />}
        ListHeaderComponent={
          <>
            <View style={styles.secao}>
              <Text style={styles.secaoTitulo}>Novo Material</Text>
              <Text style={styles.label}>Nome do material</Text>
              <TextInput testID="input-nome" style={styles.input} placeholder="Ex: Luvas descartáveis" placeholderTextColor="#aaa" value={nome} onChangeText={setNome} />
              <Text style={styles.label}>Quantidade inicial</Text>
              <TextInput testID="input-quantidade" style={styles.input} placeholder="Ex: 100" placeholderTextColor="#aaa" value={quantidade} onChangeText={setQuantidade} keyboardType="numeric" />
              <TouchableOpacity testID="btn-cadastrar" style={[styles.btnPrimario, salvando && styles.btnDesabilitado]} onPress={cadastrarMaterial} disabled={salvando} activeOpacity={0.8}>
                {salvando ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnTexto}>+ Cadastrar Material</Text>}
              </TouchableOpacity>
            </View>

            <View style={styles.dashboard}>
              {[
                { num: filtrados.length, label: 'Total',    alerta: false },
                { num: criticos,         label: 'Críticos', alerta: criticos > 0 },
                { num: normais,          label: 'Normais',  alerta: false },
              ].map(({ num, label, alerta }) => (
                <View key={label} style={[styles.dashCard, alerta && styles.dashCardAlerta]}>
                  <Text style={[styles.dashNumero, alerta && styles.dashNumeroAlerta]}>{num}</Text>
                  <Text style={styles.dashLabel}>{label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.secao}>
              <Text style={styles.secaoTitulo}>Estoque Atual</Text>
              <View style={styles.buscaRow}>
                <Text style={styles.buscaIcone}>🔍</Text>
                <TextInput testID="input-busca" style={styles.inputBusca} placeholder="Pesquisar material..." placeholderTextColor="#aaa" value={busca} onChangeText={setBusca} />
              </View>
              <Text testID="total-itens" style={styles.totalItens}>
                {filtrados.length} {filtrados.length === 1 ? 'material encontrado' : 'materiais encontrados'}{busca ? ` para "${busca}"` : ''}
              </Text>
            </View>

            {carregando && <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#0d6efd" /><Text style={styles.loadingTexto}>Carregando...</Text></View>}
            {!carregando && materiais.length === 0 && <View style={styles.vazioContainer}><Text style={styles.vazioIcone}>📦</Text><Text style={styles.vazioTexto}>Nenhum material cadastrado.</Text><Text style={styles.vazioSub}>Adicione o primeiro material acima.</Text></View>}
            {!carregando && materiais.length > 0 && filtrados.length === 0 && <View style={styles.vazioContainer}><Text style={styles.vazioIcone}>🔍</Text><Text style={styles.vazioTexto}>Nenhum resultado para "{busca}".</Text></View>}
          </>
        }
        renderItem={({ item }) => (
          <MaterialCard
            item={item}
            retiradaValor={retirada[item.id] || ''}
            onChangeRetirada={(txt) => setRetirada((r) => ({ ...r, [item.id]: txt }))}
            onBaixar={() => baixarEstoque(item)}
            onExcluir={() => excluirMaterial(item.id)}
          />
        )}
      />
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const AZUL    = '#0d6efd';
const VERDE   = '#198754';
const VERMELHO= '#dc3545';
const LARANJA = '#fd7e14';
const C_CLARO = '#f8f9fa';
const C_BORDA = '#dee2e6';
const T_PRIM  = '#212529';
const T_SEC   = '#6c757d';

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: AZUL },
  listContent: { backgroundColor: C_CLARO, paddingBottom: 40 },

  header:      { backgroundColor: AZUL, paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 16 : 8, paddingBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  headerSub:   { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },

  secao:       { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16, borderRadius: 12, padding: 16, elevation: 2 },
  secaoTitulo: { fontSize: 16, fontWeight: '700', color: T_PRIM, marginBottom: 14, borderLeftWidth: 3, borderLeftColor: AZUL, paddingLeft: 8 },

  label:       { fontSize: 13, color: T_SEC, fontWeight: '600', marginBottom: 4, marginTop: 4 },
  input:       { borderWidth: 1, borderColor: C_BORDA, backgroundColor: C_CLARO, padding: 12, marginBottom: 10, borderRadius: 8, fontSize: 15, color: T_PRIM },
  buscaRow:    { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C_BORDA, borderRadius: 8, backgroundColor: C_CLARO, paddingHorizontal: 12, marginBottom: 10 },
  buscaIcone:  { fontSize: 16, marginRight: 8 },
  inputBusca:  { flex: 1, paddingVertical: 12, fontSize: 15, color: T_PRIM },
  totalItens:  { fontSize: 13, color: T_SEC, fontStyle: 'italic' },

  btnPrimario:     { backgroundColor: AZUL, padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  btnDesabilitado: { opacity: 0.6 },
  btnTexto:        { color: '#fff', fontWeight: '700', fontSize: 15 },

  dashboard:        { flexDirection: 'row', marginHorizontal: 16, marginTop: 16, gap: 10 },
  dashCard:         { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14, alignItems: 'center', elevation: 2 },
  dashCardAlerta:   { backgroundColor: '#fff3cd', borderWidth: 1, borderColor: '#ffc107' },
  dashNumero:       { fontSize: 28, fontWeight: '800', color: AZUL },
  dashNumeroAlerta: { color: '#d97706' },
  dashLabel:        { fontSize: 12, color: T_SEC, fontWeight: '600', marginTop: 2 },

  card:           { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 12, padding: 16, elevation: 2, borderLeftWidth: 4, borderLeftColor: VERDE },
  estoqueCritico: { backgroundColor: '#fff5f5', borderLeftColor: VERMELHO, borderWidth: 1, borderColor: '#ffc9c9' },
  cardHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  nomeMaterial:   { fontSize: 16, fontWeight: '700', color: T_PRIM, flex: 1, marginRight: 8 },

  badge:        { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  badgeOk:      { backgroundColor: '#d1fae5' },
  badgeCritico: { backgroundColor: '#fee2e2' },
  badgeTexto:   { fontSize: 11, fontWeight: '700', color: T_PRIM },

  quantidadeContainer: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 10 },
  quantidadeNumero:    { fontSize: 32, fontWeight: '800', color: T_PRIM, marginRight: 6 },
  quantidadeLabel:     { fontSize: 13, color: T_SEC },

  barraFundo:     { height: 6, backgroundColor: C_BORDA, borderRadius: 3, marginBottom: 14, overflow: 'hidden' },
  barraProgresso: { height: 6, borderRadius: 3 },
  barraOk:        { backgroundColor: VERDE },
  barraCritica:   { backgroundColor: VERMELHO },

  labelSecao:    { fontSize: 12, fontWeight: '600', color: T_SEC, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  retiradaRow:   { flexDirection: 'row', gap: 8, marginBottom: 10 },
  inputRetirada: { flex: 1, borderWidth: 1, borderColor: C_BORDA, backgroundColor: C_CLARO, padding: 10, borderRadius: 8, fontSize: 15, color: T_PRIM },
  btnBaixar:     { backgroundColor: LARANJA, paddingHorizontal: 18, borderRadius: 8, justifyContent: 'center' },

  btnExcluir:     { borderWidth: 1, borderColor: '#ffc9c9', borderRadius: 8, padding: 10, alignItems: 'center', backgroundColor: '#fff5f5' },
  btnExcluirTexto:{ color: VERMELHO, fontWeight: '600', fontSize: 14 },

  loadingContainer: { alignItems: 'center', padding: 40 },
  loadingTexto:     { marginTop: 12, color: T_SEC, fontSize: 14 },
  vazioContainer:   { alignItems: 'center', padding: 40 },
  vazioIcone:       { fontSize: 48, marginBottom: 12 },
  vazioTexto:       { fontSize: 16, fontWeight: '600', color: T_SEC },
  vazioSub:         { fontSize: 13, color: '#adb5bd', marginTop: 4 },
});