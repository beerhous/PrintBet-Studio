import React from 'react';
import styled from 'styled-components';
import { FaPrint, FaCog, FaQuestionCircle } from 'react-icons/fa';

const HeaderContainer = styled.header`
  background: linear-gradient(135deg, #007BFF 0%, #0056b3 100%);
  color: white;
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 600;
  margin: 0;
`;

const ActionSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Button = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  &.primary {
    background: #28a745;
    border-color: #28a745;
    
    &:hover {
      background: #218838;
      border-color: #218838;
    }
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Header = ({ title, onPrint, isLoading }) => {
  const handleQuickPrint = () => {
    if (!isLoading && onPrint) {
      onPrint({
        printerId: 'PRN001',
        copies: 1,
        paperWidth: 58
      });
    }
  };

  const handleSettings = () => {
    // 设置对话框将在未来实现
    alert('设置功能即将推出');
  };

  const handleHelp = () => {
    // 帮助对话框将在未来实现
    alert('帮助文档即将推出');
  };

  return (
    <HeaderContainer>
      <LogoSection>
        <Logo>
          🎯 PrintBet
        </Logo>
        <Title>{title}</Title>
      </LogoSection>
      
      <ActionSection>
        <Button 
          onClick={handleQuickPrint} 
          disabled={isLoading}
          className="primary"
        >
          {isLoading ? (
            <>
              <LoadingSpinner />
              打印中...
            </>
          ) : (
            <>
              <FaPrint />
              快速打印
            </>
          )}
        </Button>
        
        <Button onClick={handleSettings} disabled={isLoading}>
          <FaCog />
          设置
        </Button>
        
        <Button onClick={handleHelp} disabled={isLoading}>
          <FaQuestionCircle />
          帮助
        </Button>
      </ActionSection>
    </HeaderContainer>
  );
};

export default Header;