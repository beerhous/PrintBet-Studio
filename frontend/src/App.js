import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// 组件导入
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import OCRUploader from './components/OCRUploader';
import BetForm from './components/BetForm';
import PrintPreview from './components/PrintPreview';
import StatusBar from './components/StatusBar';

// 服务导入
import { api } from './services/api';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
`;

const MainContainer = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const ContentContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const WorkArea = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
  padding: 16px;
  gap: 16px;
`;

const LeftPanel = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
`;

const RightPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 300px;
`;

function App() {
  const [selectedPlayType, setSelectedPlayType] = useState('basketball');
  const [betData, setBetData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState({
    ocr: 'ready',
    printer: 'ready',
    totalAmount: 0,
    totalBets: 0
  });

  // 系统初始化
  useEffect(() => {
    checkSystemStatus();
  }, []);

  // 检查系统状态
  const checkSystemStatus = async () => {
    try {
      const health = await api.get('/api/health');
      console.log('System health:', health.data);
    } catch (error) {
      console.error('System check failed:', error);
      toast.error('系统连接失败，请检查后端服务');
    }
  };

  // OCR识别回调
  const handleOCRResult = (result) => {
    console.log('OCR Result:', result);
    
    if (result.success && result.parsed) {
      const { parsed } = result;
      
      // 更新选中的彩种
      if (parsed.playType) {
        setSelectedPlayType(parsed.playType);
      }
      
      // 构建投注数据
      const newBetData = {
        playType: parsed.playType || selectedPlayType,
        passType: parsed.passType || '1x1',
        multiplier: parsed.multiplier || 1,
        bets: []
      };
      
      // 转换投注项
      if (parsed.results && parsed.results.length > 0) {
        parsed.results.forEach(result => {
          if (parsed.playType === 'dlt') {
            // 大乐透格式
            newBetData.bets.push({
              type: 'multiple',
              front: result.front || [],
              back: result.back || [],
              added: result.added || 0
            });
          } else if (parsed.playType === 'pls') {
            // 排列三/五格式
            newBetData.bets.push({
              type: result.gameType || 'single',
              numbers: result.numbers || [],
              sum: result.sum
            });
          } else {
            // 竞彩格式
            newBetData.bets.push({
              match: result.match,
              type: result.type,
              choice: result.choice
            });
          }
        });
      }
      
      setBetData(newBetData);
      toast.success(`OCR识别成功，共识别${newBetData.bets.length}注`);
      
    } else {
      toast.error('OCR识别失败，请手动输入');
    }
  };

  // 投注单更新回调
  const handleBetUpdate = (newBetData) => {
    setBetData(newBetData);
    updateSystemStatus(newBetData);
  };

  // 更新系统状态
  const updateSystemStatus = (betData) => {
    if (betData && betData.totalAmount !== undefined) {
      setSystemStatus(prev => ({
        ...prev,
        totalAmount: betData.totalAmount || 0,
        totalBets: betData.totalBets || 0
      }));
    }
  };

  // 打印回调
  const handlePrint = async (printData) => {
    try {
      setIsLoading(true);
      
      // 如果没有投注数据，提示先创建投注单
      if (!betData) {
        toast.warning('请先创建投注单');
        return;
      }

      // 创建投注单
      const createResult = await api.post('/api/bet/create', betData);
      
      if (createResult.data.success) {
        const { textSlip, encodeSlip } = createResult.data;
        
        // 生成ESC/POS数据
        const escposResult = await api.post('/api/print/generate', {
          textSlip,
          encodeSlip,
          paperWidth: printData.paperWidth || 58
        });
        
        if (escposResult.data.success) {
          // 发送打印任务
          const printResult = await api.post('/api/print/send', {
            printerId: printData.printerId || 'PRN001',
            escposBase64: escposResult.data.escposBase64,
            copies: printData.copies || 1
          });
          
          if (printResult.data.success) {
            toast.success('打印任务已发送');
          } else {
            toast.error('打印失败: ' + printResult.data.message);
          }
        } else {
          toast.error('生成打印数据失败');
        }
      } else {
        toast.error('创建投注单失败');
      }
      
    } catch (error) {
      console.error('Print error:', error);
      toast.error('打印出错: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContainer>
      <Header 
        title="PrintBet Studio - 投注工坊"
        onPrint={handlePrint}
        isLoading={isLoading}
      />
      
      <MainContainer>
        <Sidebar 
          selectedPlayType={selectedPlayType}
          onPlayTypeChange={setSelectedPlayType}
        />
        
        <ContentContainer>
          <WorkArea>
            <LeftPanel>
              <OCRUploader 
                onOCRResult={handleOCRResult}
                disabled={isLoading}
              />
              
              <BetForm
                playType={selectedPlayType}
                initialData={betData}
                onBetUpdate={handleBetUpdate}
                disabled={isLoading}
              />
            </LeftPanel>
            
            <RightPanel>
              <PrintPreview
                betData={betData}
                onPrint={handlePrint}
                disabled={isLoading}
              />
            </RightPanel>
          </WorkArea>
          
          <StatusBar status={systemStatus} />
        </ContentContainer>
      </MainContainer>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </AppContainer>
  );
}

export default App;