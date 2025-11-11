import React from 'react';
import styled from 'styled-components';
import { 
  FaBasketballBall, 
  FaFutbol, 
  FaTicketAlt, 
  FaSortNumericDown,
  FaHistory,
  FaChartBar
} from 'react-icons/fa';

const SidebarContainer = styled.div`
  width: 240px;
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const Section = styled.div`
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
`;

const SectionTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #666;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PlayTypeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PlayTypeItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    background: #f8f9fa;
    transform: translateX(4px);
  }

  &.active {
    background: #e3f2fd;
    color: #1976d2;
    border-left: 3px solid #1976d2;
  }

  svg {
    font-size: 18px;
  }
`;

const QuickStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 13px;
  color: #666;
  
  .value {
    font-weight: 600;
    color: #333;
  }
`;

const playTypes = [
  {
    type: 'basketball',
    name: '竞彩篮球',
    icon: FaBasketballBall,
    description: '胜负、让分、大小分、比分'
  },
  {
    type: 'football',
    name: '竞彩足球', 
    icon: FaFutbol,
    description: '胜平负、比分、总进球、半全场'
  },
  {
    type: 'dlt',
    name: '大乐透',
    icon: FaTicketAlt,
    description: '单式、复式、胆拖、追加'
  },
  {
    type: 'pls',
    name: '排列三/五',
    icon: FaSortNumericDown,
    description: '单式、复式、和值'
  }
];

const Sidebar = ({ selectedPlayType, onPlayTypeChange }) => {
  return (
    <SidebarContainer>
      <Section>
        <SectionTitle>彩种选择</SectionTitle>
        <PlayTypeList>
          {playTypes.map(playType => {
            const IconComponent = playType.icon;
            return (
              <PlayTypeItem
                key={playType.type}
                className={selectedPlayType === playType.type ? 'active' : ''}
                onClick={() => onPlayTypeChange(playType.type)}
                title={playType.description}
              >
                <IconComponent />
                <span>{playType.name}</span>
              </PlayTypeItem>
            );
          })}
        </PlayTypeList>
      </Section>

      <Section>
        <SectionTitle>快速统计</SectionTitle>
        <QuickStats>
          <StatItem>
            <span>今日出票</span>
            <span className="value">0</span>
          </StatItem>
          <StatItem>
            <span>本月出票</span>
            <span className="value">0</span>
          </StatItem>
          <StatItem>
            <span>累计金额</span>
            <span className="value">¥0</span>
          </StatItem>
        </QuickStats>
      </Section>

      <Section>
        <SectionTitle>功能菜单</SectionTitle>
        <PlayTypeList>
          <PlayTypeItem>
            <FaHistory />
            <span>历史记录</span>
          </PlayTypeItem>
          <PlayTypeItem>
            <FaChartBar />
            <span>统计报表</span>
          </PlayTypeItem>
        </PlayTypeList>
      </Section>
    </SidebarContainer>
  );
};

export default Sidebar;