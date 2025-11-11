import React from 'react';
import styled from 'styled-components';
import { 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaMoneyBill,
  FaTicketAlt
} from 'react-icons/fa';

const StatusBarContainer = styled.div`
  background: white;
  border-top: 1px solid #e0e0e0;
  padding: 8px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #666;
  height: 40px;
`;

const StatusGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  
  &.online {
    color: #28a745;
  }
  
  &.offline {
    color: #dc3545;
  }
  
  &.warning {
    color: #ffc107;
  }
`;

const StatusIcon = styled.div`
  font-size: 14px;
`;

const StatusText = styled.span`
  font-weight: 500;
`;

const StatusValue = styled.span`
  font-weight: 600;
  color: #333;
`;

const StatusBar = ({ status }) => {
  const {
    ocr = 'ready',
    printer = 'ready',
    totalAmount = 0,
    totalBets = 0
  } = status || {};

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready':
      case 'online':
        return <FaCheckCircle />;
      case 'busy':
      case 'warning':
        return <FaExclamationTriangle />;
      case 'offline':
      case 'error':
        return <FaExclamationTriangle />;
      default:
        return <FaCheckCircle />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'ready':
      case 'online':
        return 'online';
      case 'busy':
      case 'warning':
        return 'warning';
      case 'offline':
      case 'error':
        return 'offline';
      default:
        return 'online';
    }
  };

  const getStatusText = (status, type) => {
    switch (type) {
      case 'ocr':
        return status === 'ready' ? 'OCR就绪' : 'OCR忙碌';
      case 'printer':
        return status === 'ready' ? '打印机就绪' : 
               status === 'online' ? '打印机在线' :
               status === 'offline' ? '打印机离线' : '打印机忙碌';
      default:
        return status;
    }
  };

  return (
    <StatusBarContainer>
      <StatusGroup>
        <StatusItem className={getStatusClass(ocr)}>
          <StatusIcon>
            {getStatusIcon(ocr)}
          </StatusIcon>
          <StatusText>
            {getStatusText(ocr, 'ocr')}
          </StatusText>
        </StatusItem>

        <StatusItem className={getStatusClass(printer)}>
          <StatusIcon>
            {getStatusIcon(printer)}
          </StatusIcon>
          <StatusText>
            {getStatusText(printer, 'printer')}
          </StatusText>
        </StatusItem>
      </StatusGroup>

      <StatusGroup>
        <StatusItem>
          <StatusIcon>
            <FaTicketAlt />
          </StatusIcon>
          <StatusText>总注数:</StatusText>
          <StatusValue>{totalBets}</StatusValue>
        </StatusItem>

        <StatusItem>
          <StatusIcon>
            <FaMoneyBill />
          </StatusIcon>
          <StatusText>总金额:</StatusText>
          <StatusValue>¥{totalAmount}</StatusValue>
        </StatusItem>

        <StatusItem>
          <StatusText>{new Date().toLocaleTimeString()}</StatusText>
        </StatusItem>
      </StatusGroup>
    </StatusBarContainer>
  );
};

export default StatusBar;