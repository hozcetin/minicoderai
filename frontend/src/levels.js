// frontend/src/levels.js

/**
 * Bir çalışma alanındaki blokların yapısını analiz eder.
 * @param {Blockly.Workspace} workspace Kontrol edilecek çalışma alanı.
 * @returns {{topBlocks: Blockly.Block[], totalBlocks: number, startBlock: Blockly.Block|null, hasOrphanBlocks: boolean}}
 */
function analyzeWorkspace(workspace) {
  const allBlocks = workspace.getAllBlocks(false);
  const topBlocks = workspace.getTopBlocks(true);
  const startBlock = topBlocks.find(b => b.type === 'when_button_clicked');
  
  const hasOrphanBlocks = startBlock ? topBlocks.length > 1 : topBlocks.some(b => b.type !== 'when_button_clicked');

  return {
    topBlocks,
    totalBlocks: allBlocks.length,
    startBlock,
    hasOrphanBlocks,
  };
}


export const allLevels = [
  {
    id: 1,
    name: "Tanışma",
    description: "Robotla ilk iletişimini kurmak için 'Robota Merhaba Dedirt' bloğunu, 'Butona Tıklandığında' bloğunun içine yerleştir.",
    // --- YENİ PUANLAMA ALANLARI ---
    optimalBlockCount: 2, // Bu seviye için ideal blok sayısı (başlangıç + eylem)
    penaltyPoint: 5,      // Her bir ceza için kesilecek puan
    // ------------------------------------
    toolbox: {
      kind: 'categoryToolbox',
      contents: [
        { kind: 'category', name: 'Olaylar', colour: 290, contents: [{ kind: 'block', type: 'when_button_clicked' }] },
        { kind: 'category', name: 'Eylemler', colour: 160, contents: [{ kind: 'block', type: 'robot_say_hello' }] }
      ]
    },
    checkSolution: (workspace) => {
      const { startBlock, hasOrphanBlocks, totalBlocks } = analyzeWorkspace(workspace);
      if (!startBlock) {
        return { status: 'NO_START_BLOCK', success: false };
      }
      if (hasOrphanBlocks) {
        return { status: 'HAS_ORPHAN_BLOCKS', success: false };
      }
      
      const nextBlock = startBlock.getNextBlock();
      if (nextBlock && nextBlock.type === 'robot_say_hello') {
        if (nextBlock.getNextBlock()) {
          return { status: 'EXTRA_BLOCKS', success: false, blockCount: totalBlocks };
        }
        return { status: 'PERFECT', success: true, blockCount: totalBlocks };
      }
      
      return { status: 'INCORRECT_LOGIC', success: false };
    }
  },
  {
    id: 2,
    name: "İlk Hareket",
    description: "Robotun 1 adım ileri gitmesini sağlamak için 'Robotu 1 Adım İlerlet' bloğunu doğru olayın içine yerleştir.",
    // --- YENİ PUANLAMA ALANLARI ---
    optimalBlockCount: 2,
    penaltyPoint: 5,
    // ------------------------------------
    toolbox: {
      kind: 'categoryToolbox',
      contents: [
        { kind: 'category', name: 'Olaylar', colour: 290, contents: [{ kind: 'block', type: 'when_button_clicked' }] },
        { kind: 'category', name: 'Hareket', colour: 210, contents: [{ kind: 'block', type: 'robot_move_forward' }] }
      ]
    },
    checkSolution: (workspace) => {
      const { startBlock, hasOrphanBlocks, totalBlocks } = analyzeWorkspace(workspace);
      if (!startBlock) {
        return { status: 'NO_START_BLOCK', success: false };
      }
      if (hasOrphanBlocks) {
        return { status: 'HAS_ORPHAN_BLOCKS', success: false };
      }

      const nextBlock = startBlock.getNextBlock();
      if (nextBlock && nextBlock.type === 'robot_move_forward') {
        if (nextBlock.getNextBlock()) {
          return { status: 'EXTRA_BLOCKS', success: false, blockCount: totalBlocks };
        }
        return { status: 'PERFECT', success: true, blockCount: totalBlocks };
      }
      
      return { status: 'INCORRECT_LOGIC', success: false };
    }
  }
];