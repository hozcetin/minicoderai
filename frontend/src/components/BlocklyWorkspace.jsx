import { useEffect, useRef, useState, useCallback } from 'react';
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { javascriptGenerator } from 'blockly/javascript';
import * as En from 'blockly/msg/en';
import Header from './Header';
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import Scene from './Scene';
import InfoModal from './InfoModal';
import { allLevels } from '../levels';
import { useAuth } from '../context/AuthContext';

Blockly.setLocale(En);

if (!Blockly.Blocks['robot_move_forward']) {
  Blockly.defineBlocksWithJsonArray([
    { "type": "when_button_clicked", "message0": "Sahnedeki Butona Tıklandığında", "nextStatement": null, "colour": 290 },
    { "type": "robot_say_hello", "message0": "Robota 'Merhaba!' dedirt", "previousStatement": null, "colour": 160 },
    { "type": "robot_move_forward", "message0": "Robotu 1 adım ilerlet", "previousStatement": null, "colour": 210 }
  ]);
  javascriptGenerator['when_button_clicked'] = (b) => javascriptGenerator.statementToCode(b, 'STACK');
  javascriptGenerator['robot_say_hello'] = (b) => "handleAction('say_hello');\n";
  javascriptGenerator['robot_move_forward'] = (b) => "handleAction('move_forward');\n";
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

  const tokenRef = useRef(token);
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

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
          completed[item.level_id] = { score: item.score };
          if (item.level_id > maxCompletedLevelId) {
            maxCompletedLevelId = item.level_id;
          }
        });
        setCompletedLevels(completed);

        const nextLevelId = maxCompletedLevelId + 1;
        let nextLevelIndex = allLevels.findIndex(level => level.id === nextLevelId);

        if (nextLevelIndex === -1 && maxCompletedLevelId > 0) {
          nextLevelIndex = allLevels.findIndex(level => level.id === maxCompletedLevelId);
        } else if (nextLevelIndex === -1) {
          nextLevelIndex = 0;
        }
        
        setCurrentLevelIndex(nextLevelIndex);

      } catch (error) {
        console.error("İlerleme verisi çekilirken hata:", error);
      }
    };
    fetchProgressAndSetLevel();
  }, [token]);

  useEffect(() => {
    if (!blocklyDiv.current) return;
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

  const saveProgress = useCallback(async (levelId, score) => {
    const currentToken = tokenRef.current;
    if (!currentToken) return;
    try {
      await fetch('http://localhost:3001/api/progress/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
        body: JSON.stringify({ level_id: levelId, score: score })
      });
      setCompletedLevels(prev => ({ ...prev, [levelId]: { score } }));
    } catch (error) {
      console.error('İlerleme kaydı sırasında hata:', error);
    }
  }, []);

  const handleAnimationComplete = useCallback((result) => {
    if (result.success) {
      saveProgress(result.levelId, result.score);
      setModalContent({
        title: '🎉 Harika İş! �',
        message: `Tebrikler, Seviye ${result.levelId}'i başarıyla tamamladın!`,
        score: result.score,
        badges: result.badge ? [result.badge] : []
      });
      setIsModalOpen(true);
    }
  }, [saveProgress]);
  
  const runCode = () => {
    if (!workspace) return;
    setAction('');
    setIsModalOpen(false);

    const result = allLevels[currentLevelIndex].checkSolution(workspace);

    if (result.success) {
      if(allLevels[currentLevelIndex].id === 1) setAction('say_hello');
      if(allLevels[currentLevelIndex].id === 2) setAction('move_forward');
    } else {
      setModalContent({ title: '🤔 Bir Daha Dene!', message: allLevels[currentLevelIndex].description, score: 0, badges: [] });
      setIsModalOpen(true);
    }
  };
  
  const goToNextLevel = () => {
    if (currentLevelIndex < allLevels.length - 1) {
      setCurrentLevelIndex(prevIndex => prevIndex + 1);
    } else {
      alert("Tebrikler, şimdilik tüm seviyeleri tamamladınız!");
    }
    setAction('');
    setIsModalOpen(false);
  };
  
  // --- DÜZELTME BURADA ---
  const handleLevelSelect = (levelId) => {
    const levelIndex = allLevels.findIndex(l => l.id === levelId);
    if (levelIndex === -1) return; // Seviye bulunamazsa bir şey yapma

    const isCompleted = completedLevels[levelId];
    
    // Tamamlanan en yüksek seviyeyi bul
    const maxCompletedLevelId = Object.keys(completedLevels).length > 0
      ? Math.max(...Object.keys(completedLevels).map(Number))
      : 0;
    
    // Kilidi açılmış en son seviye
    const highestUnlockedLevelId = maxCompletedLevelId + 1;

    // Gidilmek istenen seviye ya tamamlanmış OLMALI ya da kilidi açık olan İLK seviye OLMALI
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f4f5f7' }}>
      <Header
        levels={allLevels}
        currentLevelId={currentLevel.id}
        completedLevels={completedLevels}
        onLevelSelect={handleLevelSelect}
      />
      <div style={{ flexGrow: 1, overflow: 'hidden' }}>
        <Allotment
          defaultSizes={[35, 65]}
          onChange={() => { if (workspace) Blockly.svgResize(workspace); }}
        >
          <Allotment.Pane minSize={350}>
            <div ref={blocklyDiv} style={{ height: '100%', width: '100%' }} />
          </Allotment.Pane>
          <Allotment.Pane>
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <button onClick={runCode} style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10 }}>Çalıştır</button>
              <Scene 
                action={action} 
                onComplete={() => handleAnimationComplete({ levelId: currentLevel.id, ...currentLevel.checkSolution(workspace) })}
                levelId={currentLevel.id}
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
        />
      )}
    </div>
  );
}

export default BlocklyWorkspace;