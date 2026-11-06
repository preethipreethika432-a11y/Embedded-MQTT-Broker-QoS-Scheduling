
import { useState, useEffect } from 'react';
import './App.css';

import { signInAnonymously } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { auth, database } from './firebase';

function App() {
  const [activeTab, setActiveTab] = useState('Overview');

  const [tdsData, setTdsData] = useState(null);
  const [waterData, setWaterData] = useState(null);
  const [connection, setConnection] = useState('Connecting...');

  useEffect(() => {
    let cancelled = false;
    let unsubscribeTDS = null;
    let unsubscribeWater = null;

    signInAnonymously(auth)
      .then(() => {
        if (cancelled) return;

        console.log('Firebase Authentication Successful');

        const tdsRef = ref(database, 'sensors/tds/latest');
        const waterRef = ref(database, 'sensors/water2/latest');

        unsubscribeTDS = onValue(
          tdsRef,
          (snapshot) => {
            if (cancelled) return;
            setTdsData(snapshot.val());
            setConnection('Connected');
            console.log('TDS data received:', snapshot.val());
          },
          (error) => {
            console.error('TDS read error:', error);
            setConnection('Database access error');
          }
        );

        unsubscribeWater = onValue(
          waterRef,
          (snapshot) => {
            if (cancelled) return;
            setWaterData(snapshot.val());
            setConnection('Connected');
            console.log('Water data received:', snapshot.val());
          },
          (error) => {
            console.error('Water read error:', error);
            setConnection('Database access error');
          }
        );
      })
      .catch((error) => {
        console.error('Firebase Authentication Error:', error);
        setConnection('Authentication failed');
      });

    return () => {
      cancelled = true;
      if (unsubscribeTDS) unsubscribeTDS();
      if (unsubscribeWater) unsubscribeWater();
    };
  }, []);

  const getSensorValue = (data) => {
    if (!data) return '--';
    return data.value ?? data.Value ?? '--';
  };

  const getSensorStatus = (data) => {
    return data?.status ?? 'Waiting for data';
  };

  const getSensorPriority = (data) => {
    return data?.priority ?? '--';
  };

  const sensors = [
    {
      name: 'TDS Sensor',
      topic: 'sensor/tds',
      value: getSensorValue(tdsData),
      unit: 'ppm',
      status: getSensorStatus(tdsData),
      priority: getSensorPriority(tdsData),
    },
    {
      name: 'Water Sensor',
      topic: 'sensor/water2',
      value: getSensorValue(waterData),
      unit: 'level',
      status: getSensorStatus(waterData),
      priority: getSensorPriority(waterData),
    },
  ];

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">◈</div>
          <div>
            <h2>MQTT Monitor</h2>
            <span>Embedded Systems</span>
          </div>
        </div>

        <p className="menu-label">MONITORING</p>

        {['Overview', 'Sensor Readings', 'Priority Scheduler', 'History'].map(item => (
          <button
            key={item}
            className={`nav-item ${activeTab === item ? 'active' : ''}`}
            onClick={() => setActiveTab(item)}
          >
            {item === 'Overview' ? '▦' :
              item === 'Sensor Readings' ? '⌁' :
                item === 'Priority Scheduler' ? '⇅' : '◷'}
            <span>{item}</span>
          </button>
        ))}

        <div className="sidebar-bottom">
          <span className="status-dot"></span>
          <div>
            <strong>Firebase</strong>
            <small>{connection}</small>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">EMBEDDED MQTT BROKER QoS</p>
            <h1>{activeTab}</h1>
            <p className="subtitle">
              Real-time sensor monitoring and priority scheduling
            </p>
          </div>

          <div className="connection-pill">
            <span className="status-dot"></span>
            {connection}
          </div>
        </header>

        <section className="welcome-card">
          <div>
            <p className="eyebrow">SYSTEM MONITOR</p>
            <h2>Sensor & Priority Monitoring</h2>
            <p>
              Monitor sensor messages and observe the priority scheduler workflow.
            </p>
          </div>
          <div className="hero-symbol">⌁</div>
        </section>

        <section className="section-heading">
          <div>
            <h2>Sensor Overview</h2>
            <p>Live values from Firebase Realtime Database.</p>
          </div>
          <span className="small-tag">2 SENSOR NODES</span>
        </section>

        <section className="sensor-grid">
          {sensors.map(sensor => (
            <article className="sensor-card" key={sensor.topic}>
              <div className="card-top">
                <div className="sensor-icon">
                  {sensor.name === 'TDS Sensor' ? '≋' : '◉'}
                </div>
                <span className="waiting-badge">
                  {sensor.status === 'Waiting for data' ? 'Waiting' : 'Live'}
                </span>
              </div>

              <h3>{sensor.name}</h3>
              <p className="topic">{sensor.topic}</p>

              <div className="reading">
                {sensor.value}
                <span>{sensor.unit}</span>
              </div>

              <div className="card-footer">
                <span>Status</span>
                <strong>{sensor.status}</strong>
              </div>

              <div className="card-footer">
                <span>Priority</span>
                <strong>{sensor.priority}</strong>
              </div>
            </article>
          ))}
        </section>

        <section className="section-heading">
          <div>
            <h2>Priority Scheduler</h2>
            <p>Expected processing rule configured in the prototype.</p>
          </div>
        </section>

        <section className="priority-grid">
          <article className="priority-card critical">
            <span className="priority-number">01</span>
            <div>
              <h3>CRITICAL</h3>
              <p>Higher priority — processed first</p>
            </div>
            <span className="priority-label">Priority 1</span>
          </article>

          <article className="priority-card normal">
            <span className="priority-number">02</span>
            <div>
              <h3>NORMAL</h3>
              <p>Lower priority — processed after critical</p>
            </div>
            <span className="priority-label">Priority 2</span>
          </article>
        </section>

        <section className="info-card">
          <div className="info-icon">i</div>
          <div>
            <h3>{activeTab}</h3>
            <p>
              Firebase live sensor readings are connected.
              Actual message processing order and STM32 acknowledgements
              are not displayed yet.
            </p>
          </div>
        </section>

        <footer>
          Embedded MQTT Broker QoS Monitoring · ESP32 · Python · STM32 · Firebase
        </footer>
      </main>
    </div>
  );
}

export default App;
