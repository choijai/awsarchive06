'use client';

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AWSGraph, { NODES, CAT, AWSNode } from '@/components/aws-graph';
import { CONCEPTS, ConceptKey } from '@/components/aws-concepts';
import { generateSAAProblem, Problem } from '@/components/api';

export default function HomeScreen() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const selectedNode = useMemo(() => {
    return NODES.find(n => n.id === selectedId);
  }, [selectedId]);

  const filteredNodes = useMemo(() => {
    return NODES.filter(node => {
      const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          node.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !categoryFilter || node.cat === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, categoryFilter]);

  const concept = selectedNode ? CONCEPTS[selectedNode.id as ConceptKey] : null;

  const handleGenerateProblem = async () => {
    if (!selectedNode) {
      Alert.alert('알림', '서비스를 선택한 후 문제를 생성하세요');
      return;
    }

    setLoading(true);
    setSelectedAnswer(null);

    try {
      const problem = await generateSAAProblem([selectedNode.name], '보통');
      setProblem(problem);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '문제 생성 실패';
      Alert.alert('오류', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          🎓 AWS SSA 시험 준비
        </ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          AWS 서비스 관계도를 클릭해서 상세 정보를 확인하세요
        </ThemedText>
      </ThemedView>

      {/* Main Layout */}
      <View style={styles.mainLayout}>
        {/* Left: Graph Panel */}
        <View style={styles.graphPanel}>
          {/* Search & Filter Bar */}
          <ThemedView style={styles.filterBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="서비스 검색..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </ThemedView>

          {/* Category Filter */}
          <ScrollView
            horizontal
            style={styles.categoryScroll}
            showsHorizontalScrollIndicator={false}
          >
            <View style={styles.categoryFilterContainer}>
              <CategoryButton
                label="전체"
                active={categoryFilter === null}
                onPress={() => setCategoryFilter(null)}
              />
              {Object.entries(CAT).map(([key, value]) => (
                <CategoryButton
                  key={key}
                  label={value.label}
                  color={value.color}
                  active={categoryFilter === key}
                  onPress={() => setCategoryFilter(categoryFilter === key ? null : key)}
                />
              ))}
            </View>
          </ScrollView>

          {/* Graph */}
          <View style={styles.graphContainer}>
            <AWSGraph
              selectedId={selectedId}
              onSelectNode={(node) => setSelectedId(node?.id || null)}
            />
          </View>

          {/* Node List */}
          <ScrollView style={styles.nodeList}>
            <View style={styles.nodeListContent}>
              {filteredNodes.map(node => (
                <NodeListItem
                  key={node.id}
                  node={node}
                  isSelected={node.id === selectedId}
                  onPress={() => setSelectedId(node.id)}
                />
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Right: Detail Panel */}
        <View style={styles.detailPanel}>
          {problem ? (
            // Problem View
            <ScrollView style={styles.detailContent}>
              <ThemedView style={styles.problemSection}>
                <ThemedText type="title" style={styles.problemTitle}>
                  📝 생성된 문제
                </ThemedText>

                {/* Question */}
                <ThemedView style={styles.questionContainer}>
                  <ThemedText type="subtitle" style={styles.sectionTitle}>
                    문제
                  </ThemedText>
                  <ThemedText style={styles.questionText}>
                    {problem.question}
                  </ThemedText>
                  <ThemedText style={styles.constraintText}>
                    제약: {problem.constraint.join(' + ')}
                  </ThemedText>
                </ThemedView>

                {/* Options */}
                <ThemedView style={styles.optionsContainer}>
                  {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={[
                        styles.optionButton,
                        selectedAnswer === opt && {
                          backgroundColor:
                            opt === problem.answer ? '#4CAF50' : '#F44336',
                        },
                      ]}
                      onPress={() => setSelectedAnswer(opt)}
                      disabled={!!selectedAnswer}
                    >
                      <ThemedText
                        style={[
                          styles.optionText,
                          selectedAnswer === opt && { color: '#fff' },
                        ]}
                      >
                        {opt}. {problem.options[opt]}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ThemedView>

                {/* Explanation */}
                {selectedAnswer && (
                  <ThemedView
                    style={[
                      styles.explanationContainer,
                      {
                        backgroundColor:
                          selectedAnswer === problem.answer
                            ? 'rgba(76, 175, 80, 0.1)'
                            : 'rgba(244, 67, 54, 0.1)',
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.explanationTitle,
                        {
                          color:
                            selectedAnswer === problem.answer ? '#4CAF50' : '#F44336',
                        },
                      ]}
                    >
                      {selectedAnswer === problem.answer ? '✅ 정답!' : '❌ 오답'}
                    </ThemedText>
                    <ThemedText style={styles.explanationText}>
                      정답: {problem.answer}
                    </ThemedText>
                    <ThemedText style={styles.explanationText}>
                      {problem.explanation.correct}
                    </ThemedText>
                    {selectedAnswer !== problem.answer && (
                      <ThemedText
                        style={[
                          styles.explanationText,
                          { color: '#F44336', marginTop: 10 },
                        ]}
                      >
                        {
                          problem.explanation[
                            `trap_${selectedAnswer}` as keyof typeof problem.explanation
                          ]
                        }
                      </ThemedText>
                    )}
                  </ThemedView>
                )}

                {/* Generate New Problem */}
                <TouchableOpacity
                  style={styles.newProblemButton}
                  onPress={() => {
                    setProblem(null);
                    setSelectedAnswer(null);
                  }}
                >
                  <ThemedText style={styles.newProblemButtonText}>
                    다른 문제 생성
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ScrollView>
          ) : selectedNode && concept ? (
            <ScrollView style={styles.detailContent}>
              <ThemedView style={styles.detailHeader}>
                <ThemedText style={styles.detailEmoji}>{selectedNode.emoji}</ThemedText>
                <ThemedText type="title" style={styles.detailTitle}>
                  {concept.title}
                </ThemedText>
                <ThemedText style={styles.detailSubtitle}>
                  {concept.subtitle}
                </ThemedText>
              </ThemedView>

              {/* Easy Explanation */}
              <ThemedView style={styles.section}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  💡 쉽게 이해하기
                </ThemedText>
                <ThemedText style={styles.easyText}>
                  {concept.easy}
                </ThemedText>
              </ThemedView>

              {/* Key Points */}
              <ThemedView style={styles.section}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  🎯 핵심 포인트
                </ThemedText>
                {concept.points.map((point, idx) => (
                  <ThemedView key={idx} style={styles.pointContainer}>
                    <ThemedText type="defaultSemiBold" style={styles.pointLabel}>
                      {point.label}
                    </ThemedText>
                    <ThemedText style={styles.pointText}>
                      {point.text}
                    </ThemedText>
                    <ThemedText style={styles.pointEasy}>
                      {point.easy}
                    </ThemedText>
                  </ThemedView>
                ))}
              </ThemedView>

              {/* Related Services */}
              <ThemedView style={styles.section}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  🔗 연관 서비스
                </ThemedText>
                <View style={styles.relatedServices}>
                  {/* 여기에 연관 서비스 렌더링 */}
                </View>
              </ThemedView>

              {/* Generate Problem Button */}
              <TouchableOpacity
                style={[styles.generateProblemButton, loading && { opacity: 0.6 }]}
                onPress={handleGenerateProblem}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText style={styles.generateProblemButtonText}>
                    🚀 이 서비스로 문제 생성
                  </ThemedText>
                )}
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyStateText}>
                서비스를 선택하면{'\n'}상세 정보가 표시됩니다
              </ThemedText>
            </View>
          )}
        </View>
      </View>
    </ThemedView>
  );
}

// Category Filter Button Component
function CategoryButton({
  label,
  color,
  active,
  onPress,
}: {
  label: string;
  color?: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <View
      style={[
        styles.categoryButton,
        active && { backgroundColor: color || '#2196F3' },
      ]}
      onTouchEnd={onPress}
    >
      <ThemedText
        style={[
          styles.categoryButtonText,
          active && { color: 'white' },
        ]}
      >
        {label}
      </ThemedText>
    </View>
  );
}

// Node List Item Component
function NodeListItem({
  node,
  isSelected,
  onPress,
}: {
  node: AWSNode;
  isSelected: boolean;
  onPress: () => void;
}) {
  const catColor = CAT[node.cat].color;

  return (
    <View
      style={[
        styles.nodeListItem,
        isSelected && { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
      ]}
      onTouchEnd={onPress}
    >
      <View style={[styles.nodeListItemColorBar, { backgroundColor: catColor }]} />
      <View style={styles.nodeListItemContent}>
        <ThemedText type="defaultSemiBold" style={styles.nodeListItemName}>
          {node.emoji} {node.name}
        </ThemedText>
        <ThemedText style={styles.nodeListItemDesc}>
          {node.desc}
        </ThemedText>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#1a1a1a',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#aaa',
  },
  mainLayout: {
    flex: 1,
    flexDirection: 'row',
    gap: 15,
    padding: 15,
  },
  graphPanel: {
    flex: 2,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  filterBar: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  categoryScroll: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryFilterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    whiteSpace: 'nowrap' as any,
  },
  categoryButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  graphContainer: {
    flex: 1,
    minHeight: 300,
    backgroundColor: '#060e18',
    borderRadius: 6,
    margin: 10,
    overflow: 'hidden',
  },
  nodeList: {
    maxHeight: 200,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  nodeListContent: {
    padding: 8,
  },
  nodeListItem: {
    flexDirection: 'row',
    marginBottom: 8,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#eee',
  },
  nodeListItemColorBar: {
    width: 4,
  },
  nodeListItemContent: {
    flex: 1,
    padding: 10,
  },
  nodeListItemName: {
    fontSize: 14,
    marginBottom: 3,
    color: '#333',
  },
  nodeListItemDesc: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  detailPanel: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  detailContent: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
  },
  detailHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  detailEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  detailTitle: {
    fontSize: 24,
    marginBottom: 5,
    textAlign: 'center',
    color: '#333',
  },
  detailSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  easyText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#555',
    fontStyle: 'italic',
  },
  pointContainer: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pointLabel: {
    fontSize: 13,
    marginBottom: 5,
    color: '#2196F3',
  },
  pointText: {
    fontSize: 13,
    color: '#333',
    marginBottom: 5,
    lineHeight: 18,
  },
  pointEasy: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  relatedServices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  problemSection: {
    padding: 20,
  },
  problemTitle: {
    fontSize: 20,
    marginBottom: 20,
    color: '#333',
  },
  questionContainer: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  questionText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#555',
    marginBottom: 10,
  },
  constraintText: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    fontStyle: 'italic',
  },
  optionsContainer: {
    marginBottom: 20,
    gap: 10,
  },
  optionButton: {
    padding: 12,
    borderRadius: 6,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  optionText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  explanationContainer: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 12,
    color: '#555',
    lineHeight: 18,
    marginBottom: 8,
  },
  newProblemButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    alignItems: 'center',
  },
  newProblemButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  generateProblemButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#2196F3',
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
  },
  generateProblemButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
