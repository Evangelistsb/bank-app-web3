import React, {StrictMode} from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';
import "bootstrap/dist/css/bootstrap.min.css";
import { CeloProvider } from '@celo/react-celo';
import "@celo/react-celo/lib/styles.css";

ReactDOM.render(
    <CeloProvider
      dapp={{
        name:"Bank App",
        description:"Access to banking on-chain",
        url: ""
      }}
      connectionModal={{
        title: <span>Please connect your wallet to continue</span>
      }}
      >
      <StrictMode>
        <App />
      </StrictMode>
    </CeloProvider>,
    document.getElementById("root")
  );
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
