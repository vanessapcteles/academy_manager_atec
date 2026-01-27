import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';

// MOCK DATA PARA DEMONSTRAÇÃO
const SCHEDULE = [
    { id: '1', title: 'Matemática Aplicada', time: '09:00 - 12:00', room: 'Sala 101' },
    { id: '2', title: 'Programação Web', time: '13:00 - 16:00', room: 'Laboratório 2' },
];

const GRADES = [
    { id: '1', course: 'Algoritmos', grade: '18' },
    { id: '2', course: 'Sistemas Operativos', grade: '16' },
];

export default function App() {
    const [activeTab, setActiveTab] = useState('horario');

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>ATEC Mobile</Text>
                <Text style={styles.headerSub}>Área do Formando</Text>
            </View>

            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'horario' && styles.activeTab]}
                    onPress={() => setActiveTab('horario')}
                >
                    <Text style={styles.tabText}>Horário</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'notas' && styles.activeTab]}
                    onPress={() => setActiveTab('notas')}
                >
                    <Text style={styles.tabText}>Avaliações</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {activeTab === 'horario' ? (
                    SCHEDULE.map(item => (
                        <View key={item.id} style={styles.card}>
                            <Text style={styles.cardTitle}>{item.title}</Text>
                            <Text style={styles.cardInfo}>🕒 {item.time}</Text>
                            <Text style={styles.cardInfo}>📍 {item.room}</Text>
                        </View>
                    ))
                ) : (
                    GRADES.map(item => (
                        <View key={item.id} style={styles.card}>
                            <Text style={styles.cardTitle}>{item.course}</Text>
                            <Text style={styles.gradeText}>Nota Final: {item.grade}</Text>
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    header: {
        padding: 24,
        paddingTop: 48,
        backgroundColor: '#1e293b',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
    },
    headerSub: {
        color: '#94a3b8',
        fontSize: 16,
    },
    tabs: {
        flexDirection: 'row',
        padding: 12,
        gap: 12,
    },
    tab: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: '#334155',
    },
    activeTab: {
        backgroundColor: '#3b82f6',
    },
    tabText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 12,
    },
    card: {
        backgroundColor: '#1e293b',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#334155',
    },
    cardTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    cardInfo: {
        color: '#94a3b8',
        fontSize: 14,
        marginTop: 4,
    },
    gradeText: {
        color: '#10b981',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 8,
    }
});
