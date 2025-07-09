// frontend/src/levels.js

export const allLevels = [
  {
    id: 1,
    name: "Tanışma",
    description: "Robotla ilk iletişimini kurmak için blokları doğru şekilde birleştir. Unutma, 'Robota Merhaba Dedirt' bloğunu, 'Butona Tıklandığında' bloğunun içine yerleştirmelisin.",
    toolbox: {
      kind: 'categoryToolbox',
      contents: [
        { kind: 'category', name: 'Olaylar', colour: 290, contents: [{ kind: 'block', type: 'when_button_clicked' }] },
        { kind: 'category', name: 'Eylemler', colour: 160, contents: [{ kind: 'block', type: 'robot_say_hello' }] }
      ]
    },
    checkSolution: (workspace) => {
      const topBlocks = workspace.getTopBlocks(true);
      if (topBlocks.length === 1 && topBlocks[0].type === 'when_button_clicked') {
        const nextBlock = topBlocks[0].getNextBlock();
        if (nextBlock && nextBlock.type === 'robot_say_hello' && !nextBlock.getNextBlock()) {
          return { success: true, score: 100, badge: { name: 'İlk Adım', icon: '🏆' } };
        }
      }
      return { success: false };
    }
  },
  {
    id: 2,
    name: "İlk Hareket",
    description: "Robotun 1 adım ileri gitmesini sağla.",
    toolbox: {
      kind: 'categoryToolbox',
      contents: [
        { kind: 'category', name: 'Olaylar', colour: 290, contents: [{ kind: 'block', type: 'when_button_clicked' }] },
        { kind: 'category', name: 'Hareket', colour: 210, contents: [{ kind: 'block', type: 'robot_move_forward' }] }
      ]
    },
    checkSolution: (workspace) => {
      const topBlocks = workspace.getTopBlocks(true);
      if (topBlocks.length === 1 && topBlocks[0].type === 'when_button_clicked') {
        const nextBlock = topBlocks[0].getNextBlock();
        if (nextBlock && nextBlock.type === 'robot_move_forward' && !nextBlock.getNextBlock()) {
          return { success: true, score: 150, badge: { name: 'Yürüyen Robot', icon: '🤖' } };
        }
      }
      return { success: false };
    }
  }
  // ... diğer seviyeler buraya eklenecek
];