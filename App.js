import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  RefreshControl,
  Alert,
  Platform
} from 'react-native';
import axios from 'axios';

// ─────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────
const API = 'https://6a2b3936b687a7d5cbc4f9a4.mockapi.io/Materiais';
const ESTOQUE_CRITICO_LIMITE = 10;

// ─────────────────────────────────────────────
// Utilitários exportados (mantidos para testes)
// ─────────────────────────────────────────────
export function validarRetirada(estoqueAtual, quantidadeRetirada) {
  const estoque = Number(estoqueAtual);
  const retirada = Number(quantidadeRetirada);
  if (isNaN(retirada) || isNaN(estoque)) return false;
  if (retirada <= 0) return false;
  if (retirada > estoque) return false;
  return true;
}

// ─────────────────────────────────────────────
// Componente: Badge de status de estoque
// ─────────────────────────────────────────────
function EstoqueBadge({ quantidade }) {
  const qtd = Number(quantidade);
  const critico = qtd < ESTOQUE_CRITICO_LIMITE;
  return (
    <View style={[styles.badge, critico ? styles.badgeCritico : styles.badgeOk]}>
      <Text style={styles.badgeTexto}>
        {critico ? '⚠ Crítico' : '✓ Normal'}
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────
// Componente: Card de material
// ─────────────────────────────────────────────
function MaterialCard({ item, retiradaValor, onChangeRetirada, onBaixar, onExcluir }) {
  const qtd = Number(item.Quantidade);
  const critico = qtd < ESTOQUE_CRITICO_LIMITE;

  return (
    <View
      style={[styles.card, critico && styles.estoqueCritico]}
      accessibilityLabel={critico ? 'estoque-critico' : undefined}
    >
      {/* Cabeçalho do card */}
      <View style={styles.cardHeader}>
        <Text style={styles.nomeMaterial} numberOfLines={1}>
          {item.Nome}
        </Text>
        <EstoqueBadge quantidade={item.Quantidade} />
      </View>

      {/* Quantidade em destaque */}
      <View style={styles.quantidadeContainer}>
        <Text style={styles.quantidadeNumero}>{item.Quantidade}</Text>
        <Text style={styles.quantidadeLabel}>unidades em estoque</Text>
      </View>

      {/* Barra de progresso visual (até 100 unidades como referência) */}
      <View style={styles.barraFundo}>
        <View
          style={[
            styles.barraProgresso,
            { width: `${Math.min(qtd, 100)}%` },
            critico ? styles.barraCritica : styles.barraOk
          ]}
        />
      </View>

      {/* Seção de retirada */}
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
        <TouchableOpacity
          testID="btn-baixar"
          style={styles.btnBaixar}
          onPress={onBaixar}
          activeOpacity={0.8}
        >
          <Text style={styles.btnTexto}>Baixar</Text>
        </TouchableOpacity>
      </View>

      {/* Botão excluir */}
      <TouchableOpacity
        testID="btn-excluir"
        style={styles.btnExcluir}
        onPress={() =>
          Alert.alert(
            'Excluir material',
            `Tem certeza que deseja excluir "${item.Nome}"?`,
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Excluir', style: 'destructive', onPress: onExcluir }
            ]
          )
        }
        activeOpacity={0.8}
      >
        <Text style={styles.btnExcluirTexto}>🗑 Excluir</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─────────────────────────────────────────────
// Tela principal
// ─────────────────────────────────────────────
export default function App() {
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [materiais, setMateriais] = useState([]);
  const [retirada, setRetirada] = useState({});
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    carregarMateriais();
  }, []);

  // ── Carregar materiais ──────────────────────
  const carregarMateriais = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setCarregando(true);

    try {
      const response = await axios.get(API, { timeout: 8000 });
      setMateriais(response.data);
    } catch (error) {
      const msg =
        error.code === 'ECONNABORTED'
          ? 'Tempo de conexão esgotado. Verifique sua internet e tente novamente.'
          : 'Não foi possível carregar os materiais. Verifique sua conexão.';
      Alert.alert('Erro de conexão', msg);
    } finally {
      setCarregando(false);
      setRefreshing(false);
    }
  }, []);

  // ── Cadastrar material ──────────────────────
  const cadastrarMaterial = async () => {
    if (nome.trim() === '' || quantidade.trim() === '') {
      Alert.alert('Campos obrigatórios', 'Informe o nome e a quantidade do material.');
      return;
    }
    if (isNaN(Number(quantidade)) || Number(quantidade) <= 0) {
      Alert.alert('Quantidade inválida', 'Informe um número válido maior que zero.');
      return;
    }

    setSalvando(true);
    try {
      await axios.post(API, { Nome: nome.trim(), Quantidade: quantidade.trim() }, { timeout: 8000 });
      setNome('');
      setQuantidade('');
      await carregarMateriais();
    } catch (error) {
      Alert.alert('Erro ao cadastrar', 'Não foi possível cadastrar o material. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  // ── Excluir material ────────────────────────
  const excluirMaterial = async (id) => {
    try {
      await axios.delete(`${API}/${id}`, { timeout: 8000 });
      setMateriais((lista) => lista.filter((item) => item.id !== id));
    } catch (error) {
      Alert.alert('Erro ao excluir', 'Não foi possível excluir o material. Tente novamente.');
    }
  };

  // ── Baixar estoque ──────────────────────────
  const baixarEstoque = async (item) => {
    const quantidadeRetirada = Number(retirada[item.id] || 0);
    const estoqueAtual = Number(item.Quantidade);

    if (!validarRetirada(estoqueAtual, quantidadeRetirada)) {
      Alert.alert(
        'Retirada inválida',
        quantidadeRetirada <= 0
          ? 'Informe uma quantidade maior que zero.'
          : `Estoque insuficiente. Disponível: ${estoqueAtual} unidades.`
      );
      return;
    }

    try {
      const novoEstoque = estoqueAtual - quantidadeRetirada;
      await axios.put(`${API}/${item.id}`, { Nome: item.Nome, Quantidade: novoEstoque.toString() }, { timeout: 8000 });
      setRetirada((r) => ({ ...r, [item.id]: '' }));
      await carregarMateriais();
    } catch (error) {
      Alert.alert('Erro ao atualizar', 'Não foi possível atualizar o estoque. Tente novamente.');
    }
  };

  // ── Filtro ──────────────────────────────────
  const materiaisFiltrados = materiais.filter((item) =>
    item.Nome.toLowerCase().includes(busca.toLowerCase())
  );

  const totalCriticos = materiaisFiltrados.filter(
    (item) => Number(item.Quantidade) < ESTOQUE_CRITICO_LIMITE
  ).length;

  // ── Render ──────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0d6efd" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Almoxarifado</Text>
        <Text style={styles.headerSub}>Enfermagem • Controle de Estoque</Text>
      </View>

      <FlatList
        testID="lista-materiais"
        data={materiaisFiltrados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => carregarMateriais(true)} colors={['#0d6efd']} />
        }
        ListHeaderComponent={
          <>
            {/* ── Cadastro ── */}
            <View style={styles.secao}>
              <Text style={styles.secaoTitulo}>Novo Material</Text>

              <Text style={styles.label}>Nome do material</Text>
              <TextInput
                testID="input-nome"
                style={styles.input}
                placeholder="Ex: Luvas descartáveis"
                placeholderTextColor="#aaa"
                value={nome}
                onChangeText={setNome}
              />

              <Text style={styles.label}>Quantidade inicial</Text>
              <TextInput
                testID="input-quantidade"
                style={styles.input}
                placeholder="Ex: 100"
                placeholderTextColor="#aaa"
                value={quantidade}
                onChangeText={setQuantidade}
                keyboardType="numeric"
              />

              <TouchableOpacity
                testID="btn-cadastrar"
                style={[styles.btnPrimario, salvando && styles.btnDesabilitado]}
                onPress={cadastrarMaterial}
                disabled={salvando}
                activeOpacity={0.8}
              >
                {salvando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnTexto}>+ Cadastrar Material</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* ── Dashboard ── */}
            <View style={styles.dashboard}>
              <View style={styles.dashCard}>
                <Text style={styles.dashNumero}>{materiaisFiltrados.length}</Text>
                <Text style={styles.dashLabel}>Total</Text>
              </View>
              <View style={[styles.dashCard, totalCriticos > 0 && styles.dashCardAlerta]}>
                <Text style={[styles.dashNumero, totalCriticos > 0 && styles.dashNumeroAlerta]}>
                  {totalCriticos}
                </Text>
                <Text style={styles.dashLabel}>Críticos</Text>
              </View>
              <View style={styles.dashCard}>
                <Text style={styles.dashNumero}>
                  {materiaisFiltrados.filter((i) => Number(i.Quantidade) >= ESTOQUE_CRITICO_LIMITE).length}
                </Text>
                <Text style={styles.dashLabel}>Normais</Text>
              </View>
            </View>

            {/* ── Busca ── */}
            <View style={styles.secao}>
              <Text style={styles.secaoTitulo}>Estoque Atual</Text>
              <View style={styles.buscaRow}>
                <Text style={styles.buscaIcone}>🔍</Text>
                <TextInput
                  testID="input-busca"
                  style={styles.inputBusca}
                  placeholder="Pesquisar material..."
                  placeholderTextColor="#aaa"
                  value={busca}
                  onChangeText={setBusca}
                />
              </View>

              <Text testID="total-itens" style={styles.totalItens}>
                {materiaisFiltrados.length}{' '}
                {materiaisFiltrados.length === 1 ? 'material encontrado' : 'materiais encontrados'}
                {busca.length > 0 ? ` para "${busca}"` : ''}
              </Text>
            </View>

            {/* Estado de carregamento */}
            {carregando && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0d6efd" />
                <Text style={styles.loadingTexto}>Carregando materiais...</Text>
              </View>
            )}

            {/* Estado vazio */}
            {!carregando && materiais.length === 0 && (
              <View style={styles.vazioContainer}>
                <Text style={styles.vazioIcone}>📦</Text>
                <Text style={styles.vazioTexto}>Nenhum material cadastrado.</Text>
                <Text style={styles.vazioSub}>Adicione o primeiro material acima.</Text>
              </View>
            )}

            {!carregando && materiais.length > 0 && materiaisFiltrados.length === 0 && (
              <View style={styles.vazioContainer}>
                <Text style={styles.vazioIcone}>🔍</Text>
                <Text style={styles.vazioTexto}>Nenhum resultado para "{busca}".</Text>
              </View>
            )}
          </>
        }
        renderItem={({ item }) => (
          <MaterialCard
            item={item}
            retiradaValor={retirada[item.id] || ''}
            onChangeRetirada={(texto) => setRetirada((r) => ({ ...r, [item.id]: texto }))}
            onBaixar={() => baixarEstoque(item)}
            onExcluir={() => excluirMaterial(item.id)}
          />
        )}
      />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────
// Estilos
// ─────────────────────────────────────────────
const AZUL = '#0d6efd';
const VERDE = '#198754';
const VERMELHO = '#dc3545';
const LARANJA = '#fd7e14';
const CINZA_CLARO = '#f8f9fa';
const CINZA_BORDA = '#dee2e6';
const TEXTO_PRIMARIO = '#212529';
const TEXTO_SECUNDARIO = '#6c757d';

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AZUL
  },

  // ── Header ──
  header: {
    backgroundColor: AZUL,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 16
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5
  },
  headerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2
  },

  // ── Lista / conteúdo ──
  listContent: {
    backgroundColor: CINZA_CLARO,
    paddingBottom: 40
  },

  // ── Seção ──
  secao: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2
  },
  secaoTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXTO_PRIMARIO,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: AZUL,
    paddingLeft: 8
  },

  // ── Inputs ──
  label: {
    fontSize: 13,
    color: TEXTO_SECUNDARIO,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 4
  },
  input: {
    borderWidth: 1,
    borderColor: CINZA_BORDA,
    backgroundColor: CINZA_CLARO,
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    fontSize: 15,
    color: TEXTO_PRIMARIO
  },
  buscaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CINZA_BORDA,
    borderRadius: 8,
    backgroundColor: CINZA_CLARO,
    paddingHorizontal: 12,
    marginBottom: 10
  },
  buscaIcone: {
    fontSize: 16,
    marginRight: 8
  },
  inputBusca: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: TEXTO_PRIMARIO
  },
  totalItens: {
    fontSize: 13,
    color: TEXTO_SECUNDARIO,
    fontStyle: 'italic'
  },

  // ── Botões ──
  btnPrimario: {
    backgroundColor: AZUL,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4
  },
  btnDesabilitado: {
    opacity: 0.6
  },
  btnTexto: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15
  },

  // ── Dashboard ──
  dashboard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    gap: 10
  },
  dashCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2
  },
  dashCardAlerta: {
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffc107'
  },
  dashNumero: {
    fontSize: 28,
    fontWeight: '800',
    color: AZUL
  },
  dashNumeroAlerta: {
    color: '#d97706'
  },
  dashLabel: {
    fontSize: 12,
    color: TEXTO_SECUNDARIO,
    fontWeight: '600',
    marginTop: 2
  },

  // ── Card de material ──
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: VERDE
  },
  estoqueCritico: {
    backgroundColor: '#fff5f5',
    borderLeftColor: VERMELHO,
    borderWidth: 1,
    borderColor: '#ffc9c9'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  nomeMaterial: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXTO_PRIMARIO,
    flex: 1,
    marginRight: 8
  },

  // ── Badge ──
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12
  },
  badgeOk: {
    backgroundColor: '#d1fae5'
  },
  badgeCritico: {
    backgroundColor: '#fee2e2'
  },
  badgeTexto: {
    fontSize: 11,
    fontWeight: '700',
    color: TEXTO_PRIMARIO
  },

  // ── Quantidade destaque ──
  quantidadeContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10
  },
  quantidadeNumero: {
    fontSize: 32,
    fontWeight: '800',
    color: TEXTO_PRIMARIO,
    marginRight: 6
  },
  quantidadeLabel: {
    fontSize: 13,
    color: TEXTO_SECUNDARIO
  },

  // ── Barra de progresso ──
  barraFundo: {
    height: 6,
    backgroundColor: CINZA_BORDA,
    borderRadius: 3,
    marginBottom: 14,
    overflow: 'hidden'
  },
  barraProgresso: {
    height: 6,
    borderRadius: 3
  },
  barraOk: {
    backgroundColor: VERDE
  },
  barraCritica: {
    backgroundColor: VERMELHO
  },

  // ── Retirada ──
  labelSecao: {
    fontSize: 12,
    fontWeight: '600',
    color: TEXTO_SECUNDARIO,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  retiradaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10
  },
  inputRetirada: {
    flex: 1,
    borderWidth: 1,
    borderColor: CINZA_BORDA,
    backgroundColor: CINZA_CLARO,
    padding: 10,
    borderRadius: 8,
    fontSize: 15,
    color: TEXTO_PRIMARIO
  },
  btnBaixar: {
    backgroundColor: LARANJA,
    paddingHorizontal: 18,
    borderRadius: 8,
    justifyContent: 'center'
  },

  // ── Excluir ──
  btnExcluir: {
    borderWidth: 1,
    borderColor: '#ffc9c9',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#fff5f5'
  },
  btnExcluirTexto: {
    color: VERMELHO,
    fontWeight: '600',
    fontSize: 14
  },

  // ── Loading ──
  loadingContainer: {
    alignItems: 'center',
    padding: 40
  },
  loadingTexto: {
    marginTop: 12,
    color: TEXTO_SECUNDARIO,
    fontSize: 14
  },

  // ── Vazio ──
  vazioContainer: {
    alignItems: 'center',
    padding: 40
  },
  vazioIcone: {
    fontSize: 48,
    marginBottom: 12
  },
  vazioTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXTO_SECUNDARIO
  },
  vazioSub: {
    fontSize: 13,
    color: '#adb5bd',
    marginTop: 4
  }
});