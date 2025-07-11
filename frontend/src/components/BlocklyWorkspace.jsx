// frontend/src/components/BlocklyWorkspace.jsx

import { useEffect, useRef, useState, useCallback } from 'react';
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { javascriptGenerator } from 'blockly/javascript';
import * as En from 'blockly/msg/en';
import { ExecutionEngine } from '../ExecutionEngine';

import Header from './Header';
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import Scene from './Scene';
import InfoModal from './InfoModal';
import { allLevels } from '../levels';
import { useAuth } from '../context/AuthContext';

Blockly.setLocale(En);

// ... (Blok tanımlamaları aynı kalıyor) ...
if (!Blockly.Blocks['robot_move_forward']) {
  Blockly.defineBlocksWithJsonArray([
    { "type": "when_button_clicked", "message0": "Sahnedeki Butona Tıklandığında", "nextStatement": null, "colour": 290 },
    { "type": "robot_say_hello", "message0": "Robota 'Merhaba!' dedirt", "previousStatement": null, "nextStatement": null, "colour": 160 },
    { "type": "robot_move_forward", "message0": "Robotu 1 adım ilerlet", "previousStatement": null, "nextStatement": null, "colour": 210 }
  ]);
  javascriptGenerator.forBlock['when_button_clicked'] = (b) => javascriptGenerator.statementToCode(b, 'STACK');
  javascriptGenerator.forBlock['robot_say_hello'] = () => "sayHello();\n";
  javascriptGenerator.forBlock['robot_move_forward'] = () => "moveForward();\n";
}

function BlocklyWorkspace() {
    const { token } = useAuth();
    const [workspace, setWorkspace] = useState(null);
    const blocklyDiv = useRef(null);
    const [action, setAction] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({});
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    const [completedLevels, setCompletedLevels] = useState({});
    const [isCodeRunning, setIsCodeRunning] = useState(false);
    const engineRef = useRef(null);
    const tokenRef = useRef(token);
    
    // --- YENİ VERİ TOPLAMA STATE'LERİ ---
    const [attempts, setAttempts] = useState(0);
    const [startTime, setStartTime] = useState(null);
    // ---------------------------------------

    useEffect(() => { tokenRef.current = token; }, [token]);

    useEffect(() => {
    const fetchProgressAndSetLevel = async () => {
      if (!token) {
        setCompletedLevels({});
        setCurrentLevelIndex(0);
        return;
      }
      try {
        const response = await fetch('http://localhost:3001/api/progress', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('İlerleme verisi alınamadı.');
        const progressData = await response.json();
        const completed = {};
        let maxCompletedLevelId = 0;
        progressData.forEach(item => {
          // DÜZELTME: Artık 'first_score' ve 'first_stars' alanlarını kullanıyoruz.
          completed[item.level_id] = { score: item.first_score, stars: item.first_stars };
          if (item.level_id > maxCompletedLevelId) maxCompletedLevelId = item.level_id;
        });
        setCompletedLevels(completed);

        const nextLevelId = maxCompletedLevelId + 1;
        let nextLevelIndex = allLevels.findIndex(level => level.id === nextLevelId);
        if (nextLevelIndex === -1) {
             nextLevelIndex = maxCompletedLevelId > 0 ? allLevels.findIndex(l => l.id === maxCompletedLevelId) : 0;
        }
        setCurrentLevelIndex(nextLevelIndex);
      } catch (error) {
        console.error("İlerleme verisi çekilirken hata:", error);
      }
    };
    fetchProgressAndSetLevel();
  }, [token]);
  
  // Seviye değiştiğinde zamanlayıcıyı ve deneme sayısını sıfırla
  useEffect(() => {
    setStartTime(Date.now());
    setAttempts(0);
  }, [currentLevelIndex]);

  useEffect(() => {
    if (!blocklyDiv.current || !allLevels[currentLevelIndex]) return;
    const oldWorkspace = Blockly.getMainWorkspace();
    if (oldWorkspace) oldWorkspace.dispose();
    
    const ws = Blockly.inject(blocklyDiv.current, {
        toolbox: allLevels[currentLevelIndex].toolbox,
        renderer: 'zelos', theme: Blockly.Themes.Zelos, trashcan: true,
        zoom: { controls: true, wheel: true, startScale: 1.0 },
    });
    setWorkspace(ws);
    const rs = () => setTimeout(() => { if (Blockly.getMainWorkspace()) Blockly.svgResize(ws) }, 50);
    window.addEventListener('resize', rs);
    rs();
    return () => window.removeEventListener('resize', rs);
  }, [currentLevelIndex]);

  // Artık `saveProgress` tek bir iş yapıyor: veriyi backend'e göndermek.
  const saveProgress = useCallback(async (progressData) => {
    if (!tokenRef.current) return;
    try {
      const response = await fetch('http://localhost:3001/api/progress/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenRef.current}` },
        body: JSON.stringify(progressData)
      });
      const result = await response.json();
      
      // Gelen sonuca göre modalı göster ve tamamlananlar listesini güncelle
      setModalContent({ 
        title: '🎉 Harika İş!', message: `Tebrikler, Seviye ${progressData.levelId}'i başarıyla tamamladın!`,
        score: result.score, 
        stars: result.stars, // Backend'den gelen yıldız sayısını kullan
        isSuccess: true 
      });
      setIsModalOpen(true);

      setCompletedLevels(prev => ({ ...prev, [progressData.levelId]: { score: result.score, stars: result.stars } }));

    } catch (error) {
      console.error('İlerleme kaydı sırasında hata:', error);
    }
  }, []);

  const showInfoModal = (title, message, duration = 3000) => {
    setModalContent({ title, message, isInfo: true });
    setIsModalOpen(true);
    setTimeout(() => {
        setIsModalOpen(false);
        setModalContent({});
    }, duration);
  };
  
  const handleAnimationComplete = () => {
    setAction('');
    if (engineRef.current) {
      engineRef.current.continue();
    }
  };
  
  const handleExecutionFinish = useCallback(() => {
    setIsCodeRunning(false);
    engineRef.current = null;
    
    const currentLevel = allLevels[currentLevelIndex];
    if (!workspace || !currentLevel) return;

    // Seviye başarıyla tamamlandığında, toplanan tüm verileri gönder.
    const result = currentLevel.checkSolution(workspace);
    if (result.status === 'PERFECT') {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        saveProgress({
            levelId: currentLevel.id,
            attempts: attempts + 1, // Son başarılı denemeyi de say
            timeSpentSeconds: timeSpent,
            blockCount: result.blockCount
        });
    }
  }, [currentLevelIndex, workspace, saveProgress, attempts, startTime]);

  const runCode = () => {
    if (!workspace || isCodeRunning) return;
    setIsModalOpen(false);
    
    // Her "Çalıştır" basımında deneme sayısını artır
    setAttempts(prev => prev + 1);

    const allBlocks = workspace.getAllBlocks(false);
    if (allBlocks.length === 0) {
      showInfoModal('Boş Çalışma Alanı', 'Lütfen çalıştırmak için kod blokları ekleyin.');
      return;
    }
    const topBlocks = workspace.getTopBlocks(true);
    if (topBlocks.length === 1 && topBlocks[0].type === 'when_button_clicked' && !topBlocks[0].getNextBlock()) {
        showInfoModal('İyi Başlangıç!', 'Harika, başlangıç bloğunu ekledin! Şimdi içine bir eylem bloğu sürükle.');
        return;
    }

    const currentLevel = allLevels[currentLevelIndex];
    const result = currentLevel.checkSolution(workspace);

    if (result.status === 'PERFECT') {
      setIsCodeRunning(true);
      const code = javascriptGenerator.workspaceToCode(workspace);
      engineRef.current = new ExecutionEngine(code, setAction, handleExecutionFinish);
      engineRef.current.run();
    } else if (result.status === 'EXTRA_BLOCKS') {
      setModalContent({ title: '🤔 Neredeyse Oldu!', message: "Hedefe ulaştın ama sanki fazladan blokların var. Gereksiz blokları çıkarmayı dene.", isSuccess: false });
      setIsModalOpen(true);
    } else {
      showInfoModal('Başlangıç Bloğu Eksik', 'Her kodun bir başlangıç noktası olmalı. Lütfen tüm blokları "Butona Tıklandığında" bloğunun içine yerleştir.');
    }
  };
  
  // ... (goToNextLevel ve handleLevelSelect aynı kalıyor) ...
  const goToNextLevel = () => {
    if (currentLevelIndex < allLevels.length - 1) {
      setCurrentLevelIndex(prevIndex => prevIndex + 1);
    } else {
      alert("Tebrikler, şimdilik tüm seviyeleri tamamladınız!");
    }
    setAction('');
    setIsModalOpen(false);
  };
  
  const handleLevelSelect = (levelId) => {
    const levelIndex = allLevels.findIndex(l => l.id === levelId);
    if (levelIndex === -1) return;
    const isCompleted = completedLevels[levelId];
    const maxCompletedLevelId = Object.keys(completedLevels).length > 0
      ? Math.max(...Object.keys(completedLevels).map(Number))
      : 0;
    const highestUnlockedLevelId = maxCompletedLevelId + 1;
    if (isCompleted || levelId <= highestUnlockedLevelId) {
       setCurrentLevelIndex(levelIndex);
    } else {
       alert("Bu seviyeye geçmek için önceki seviyeleri tamamlamalısın!");
    }
  };
  const currentLevel = allLevels[currentLevelIndex];
  if (!currentLevel) {
    return <div>Seviyeler yükleniyor...</div>;
  }
  
    // JSX (return) kısmı aynı kalıyor
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f4f5f7' }}>
            <Header
                levels={allLevels}
                currentLevelId={currentLevel.id}
                completedLevels={completedLevels}
                // DÜZELTME: Header'a yıldızları da gönderiyoruz.
                onLevelSelect={handleLevelSelect}
            />
            <div style={{ flexGrow: 1, overflow: 'hidden' }}>
                <Allotment
                    defaultSizes={[35, 65]}
                    onChange={() => { if (workspace) Blockly.svgResize(ws); }}
                >
                    <Allotment.Pane minSize={350}>
                        <div ref={blocklyDiv} style={{ height: '100%', width: '100%' }} />
                    </Allotment.Pane>
                    <Allotment.Pane>
                        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                            <button onClick={runCode} disabled={isCodeRunning} style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10, cursor: isCodeRunning ? 'not-allowed' : 'pointer', padding: '10px 15px', fontSize: '16px' }}>
                                {isCodeRunning ? 'Çalışıyor...' : 'Çalıştır'}
                            </button>
                            <Scene
                                action={action}
                                levelId={currentLevel.id}
                                onComplete={handleAnimationComplete}
                            />
                        </div>
                    </Allotment.Pane>
                </Allotment>
            </div>
            {isModalOpen && (
                <InfoModal
                    {...modalContent}
                    onClose={() => setIsModalOpen(false)}
                    onNextLevel={goToNextLevel}
                    isSuccess={modalContent.isSuccess}
                />
            )}
        </div>
    );
}

export default BlocklyWorkspace;