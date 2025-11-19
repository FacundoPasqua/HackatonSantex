import streamlit as st
import requests
import pandas as pd
from datetime import datetime, timedelta
import plotly.express as px
import plotly.graph_objects as go

API_URL = st.secrets.get("API_URL", "http://localhost:8000")

st.set_page_config(
    page_title="Dashboard de Tests",
    page_icon="📊",
    layout="wide"
)

st.title("Dashboard de Resultados de Tests")
st.markdown("---")

# Sidebar con filtros
st.sidebar.header("🔍 Filtros")

test_type = st.sidebar.selectbox(
    "Tipo de Test",
    ["", "automotor", "inmobiliario", "embarcaciones"],
    key="filter_test_type"
)

environment = st.sidebar.selectbox(
    "Entorno",
    ["", "test", "preprod", "localhost"],
    key="filter_environment"
)

resultado_final = st.sidebar.selectbox(
    "Resultado",
    ["", "PASS", "FAIL"],
    key="filter_resultado"
)

# Construir parámetros para la API
params = {}
if test_type:
    params["test_type"] = test_type
if environment:
    params["environment"] = environment
if resultado_final:
    params["resultado_final"] = resultado_final

# Obtener resumen
try:
    summary_response = requests.get(f"{API_URL}/api/summary", params=params, timeout=5)
    if summary_response.status_code == 200:
        summary = summary_response.json()
        
        # Métricas principales
        col1, col2, col3, col4 = st.columns(4)
        with col1:
            st.metric("Total Tests", summary["total"])
        with col2:
            st.metric("✅ PASS", summary["passed"], delta=f"{summary['success_rate']}%")
        with col3:
            st.metric("❌ FAIL", summary["failed"])
        with col4:
            st.metric("Tasa de Éxito", f"{summary['success_rate']}%")
    else:
        st.error("Error al obtener resumen")
except Exception as e:
    st.error(f"Error conectando con la API: {e}")

st.markdown("---")

# Estadísticas
st.subheader("📈 Estadísticas por Tipo y Entorno")
try:
    stats_response = requests.get(f"{API_URL}/api/statistics", params=params, timeout=5)
    if stats_response.status_code == 200:
        stats = stats_response.json()
        if stats:
            stats_df = pd.DataFrame(stats)
            
            # Gráfico de barras
            fig = px.bar(
                stats_df,
                x="test_type",
                y="count",
                color="resultado_final",
                facet_col="environment",
                title="Resultados por Tipo de Test y Entorno",
                labels={"count": "Cantidad", "test_type": "Tipo de Test"}
            )
            st.plotly_chart(fig, use_container_width=True)
            
            # Tabla de estadísticas
            st.dataframe(
                stats_df,
                use_container_width=True,
                hide_index=True
            )
        else:
            st.info("No hay estadísticas disponibles con los filtros seleccionados")
except Exception as e:
    st.error(f"Error obteniendo estadísticas: {e}")

st.markdown("---")

# Resultados detallados
st.subheader("📋 Resultados Detallados")

# Paginación
limit = st.sidebar.slider("Resultados por página", 10, 100, 50)
offset = st.sidebar.number_input("Página", min_value=0, value=0, step=1) * limit

params["limit"] = limit
params["offset"] = offset

try:
    results_response = requests.get(f"{API_URL}/api/results", params=params, timeout=5)
    if results_response.status_code == 200:
        results = results_response.json()
        
        if results:
            df = pd.DataFrame(results)
            
            # Formatear columnas
            df['timestamp'] = pd.to_datetime(df['timestamp']).dt.strftime('%Y-%m-%d %H:%M:%S')
            df['resultado_final'] = df['resultado_final'].apply(
                lambda x: f"✅ {x}" if x == "PASS" else f"❌ {x}"
            )
            
            # Mostrar columnas seleccionadas
            display_cols = ['test_id', 'test_type', 'categoria', 'pregunta', 
                          'resultado_final', 'tiempo_segundos', 'timestamp']
            
            st.dataframe(
                df[display_cols],
                use_container_width=True,
                hide_index=True
            )
            
            # Botón para ver detalles completos
            if st.checkbox("Mostrar todas las columnas"):
                st.dataframe(df, use_container_width=True, hide_index=True)
        else:
            st.info("No hay resultados con los filtros seleccionados")
except Exception as e:
    st.error(f"Error obteniendo resultados: {e}")

# Gráfico de tendencias (últimas 24 horas)
st.markdown("---")
st.subheader("📉 Tendencia (Últimas 24 horas)")
try:
    recent_response = requests.get(f"{API_URL}/api/results/recent/24", timeout=5)
    if recent_response.status_code == 200:
        recent_results = recent_response.json()
        if recent_results:
            recent_df = pd.DataFrame(recent_results)
            recent_df['timestamp'] = pd.to_datetime(recent_df['timestamp'])
            recent_df['hour'] = recent_df['timestamp'].dt.floor('H')
            
            # Normalizar todos los tipos de FAIL a un solo 'FAIL'
            recent_df['resultado_final_normalizado'] = recent_df['resultado_final'].apply(
                lambda x: 'PASS' if x == 'PASS' else 'FAIL'
            )
            
            hourly_stats = recent_df.groupby(['hour', 'resultado_final_normalizado']).size().reset_index(name='count')
            hourly_stats = hourly_stats.rename(columns={'resultado_final_normalizado': 'resultado_final'})
            
            fig = px.line(
                hourly_stats,
                x='hour',
                y='count',
                color='resultado_final',
                title="Tests por Hora (Últimas 24h)",
                labels={"count": "Cantidad de Tests", "hour": "Hora"}
            )
            st.plotly_chart(fig, use_container_width=True)
except Exception as e:
    st.warning(f"No se pudieron cargar las tendencias: {e}")

