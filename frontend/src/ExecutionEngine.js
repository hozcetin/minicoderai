// frontend/src/ExecutionEngine.js

import JSInterpreter from 'js-interpreter';

export class ExecutionEngine {
  constructor(code, onAction, onFinish) {
    this.onAction = onAction;
    this.onFinish = onFinish;
    this.isDone = false; // Kodun bitip bitmediğini takip eden bayrak

    // Interpreter'ı başlatacak olan fonksiyon.
    // Bu yapı, kütüphanenin beklediği en doğru ve hatasız kullanım şeklidir.
    const initFunction = (interpreter, globalObject) => {
      // Bu fonksiyon, React'e animasyon sinyali gönderir ve interpreter'ı duraklatır.
      const asyncWrapper = (action, callback) => {
        this.onAction(action); // React'e hangi animasyonu başlatacağını söyle
        this.continueCallback = callback; // Interpreter'ın "devam et" fonksiyonunu sakla
      };

      // Bloklarımızın çağıracağı global fonksiyonları oluşturuyoruz.
      interpreter.setProperty(globalObject, 'sayHello',
        interpreter.createAsyncFunction(asyncWrapper.bind(this, 'say_hello'))
      );
      interpreter.setProperty(globalObject, 'moveForward',
        interpreter.createAsyncFunction(asyncWrapper.bind(this, 'move_forward'))
      );
    };

    // Kütüphaneyi, Vite gibi paketleyicilerle uyumlu olacak şekilde import ediyoruz.
    const Interpreter = JSInterpreter.default || JSInterpreter;
    this.interpreter = new Interpreter(code, initFunction);
  }

  // Kod yürütmeyi başlatan veya devam ettiren ana fonksiyon
  run() {
    if (this.isDone) return;

    // Interpreter'ın kendi dahili `run` metodu, bir sonraki asenkron fonksiyona
    // veya kodun sonuna kadar senkron bir şekilde çalışır.
    const hasMoreCode = this.interpreter.run();
    
    if (!hasMoreCode && !this.isDone) {
      // Eğer kod bittiyse ve daha önce bitiş sinyali gönderilmediyse...
      this.isDone = true;
      // Son animasyonun ekrana yansıması için küçük bir gecikmeyle bitiş sinyali gönder.
      // Bu, "yarış durumu"nu %100 çözer.
      setTimeout(() => this.onFinish(), 50);
    }
  }
  
  // Animasyon bittiğinde React tarafından çağrılır.
  continue() {
    if (this.isDone || !this.continueCallback) return;
    
    const callback = this.continueCallback;
    this.continueCallback = null;
    
    // Interpreter'a "kaldığın yerden devam et" komutunu ver.
    callback(); 
    
    // Yürütmeyi sürdür.
    this.run();
  }
}