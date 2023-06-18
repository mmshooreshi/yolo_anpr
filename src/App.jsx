import React, { useState, useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl"; // set backend to webgl
import Loader from "./components/loader";
import ButtonHandler from "./components/btn-handler";
import { detect, detectVideo } from "./utils/detect";
import "./style/App.css";
import "./fonts/PeydaWeb/woff/PeydaWeb-Black.woff";
import "./fonts/PeydaWeb/woff/PeydaWeb-ExtraLight.woff";


const App = () => {
  const [loading, setLoading] = useState({ loading: true, progress: 0 }); // loading state
  const [model, setModel] = useState({
    net: null,
    inputShape: [1, 0, 0, 3],
  }); // init model & input shape

  String.prototype.toPersianDigits= function(){
      var id= ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
      return this.replace(/[0-9]/g, function(w){
          return id[+w]
      });
  }

  // references
  const imageRef = useRef(null);
  const cameraRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  
  // model configs
  // const modelName = "yolov8n";
  // const [modelName, setmodelName] = useState("yolov8n");
  const [modelName, setmodelName] = useState("yolov8n-seg");
  const toggleModel = () => {
    console.log(modelName);
    // 👇️ passed function to setState
    if (modelName == "best") {
          setmodelName("yolov8n");
    } else {
       setmodelName("best");
    }
  };

  useEffect(() => {
    tf.ready().then(async () => {
      const yolov8 = await tf.loadGraphModel(
        `${window.location.href}/${modelName}_web_model/model.json`,
        {
          onProgress: (fractions) => {
            setLoading({ loading: true, progress: fractions }); // set loading fractions
          },
        }
      ); // load model

      // warming up model
      const dummyInput = tf.ones(yolov8.inputs[0].shape);
      const warmupResults = yolov8.execute(dummyInput);

      setLoading({ loading: false, progress: 1 });
      setModel({
        net: yolov8,
        inputShape: yolov8.inputs[0].shape,
      }); // set model & input shape

      tf.dispose([warmupResults, dummyInput]); // cleanup memory
    });
  }, []);

  return (
    <div className="App">
      {loading.loading && <Loader> {(loading.progress * 100).toFixed(2).toPersianDigits()}% در حال بارگیری مدل</Loader>}
      <div className="header">
        <h1>📷 تشخیص و شمارش اشیاء</h1>
        <p>
          
        </p>
      </div>
      <br/>

      <div className="content">
        <img
          src="#"
          ref={imageRef}
          onLoad={() => detect(imageRef.current, model, canvasRef.current)}
        />
        <video
          autoPlay
          muted
          ref={cameraRef}
          onPlay={() => detectVideo(cameraRef.current, model, canvasRef.current)}
        />
        <video
          autoPlay
          muted
          ref={videoRef}
          onPlay={() => detectVideo(videoRef.current, model, canvasRef.current)}
        />
        <canvas width={model.inputShape[1]} height={model.inputShape[2]} ref={canvasRef} />
      </div>

      <ButtonHandler imageRef={imageRef} cameraRef={cameraRef} videoRef={videoRef} />

      <div onClick={toggleModel} className="footer">
          <p className="codeContainer">
           <code className="code">{modelName}</code> &nbsp;  :مدل در حال اجرا 
        </p>
      </div>
      
    </div>
  );
};

export default App;
