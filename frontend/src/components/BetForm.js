import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';

import { api } from '../services/api';

const FormContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const FormTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormContent = styled.div`
  flex: 1;
  overflow-y: auto;
  min-height: 0;
`;

const ControlRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  align-items: center;
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 500;
  color: #666;
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #007BFF;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
  }

  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #007BFF;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
  }

  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
`;

const BetTable = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: ${props => props.columns || '1fr 1fr 1fr 1fr 80px'};
  background: #f8f9fa;
  padding: 12px;
  font-size: 13px;
  font-weight: 600;
  color: #666;
  border-bottom: 1px solid #e0e0e0;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: ${props => props.columns || '1fr 1fr 1fr 1fr 80px'};
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  align-items: center;
  gap: 8px;
  
  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f8f9fa;
  }
`;

const TableCell = styled.div`
  font-size: 13px;
  color: #333;
  
  input, select {
    width: 100%;
    padding: 6px 8px;
    font-size: 13px;
  }
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  color: #666;

  &:hover {
    background: #e9ecef;
    color: #333;
  }

  &.danger:hover {
    background: #f8d7da;
    color: #dc3545;
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #007BFF;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 16px;

  &:hover {
    background: #0056b3;
    transform: translateY(-1px);
  }

  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
    transform: none;
  }
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: auto;
`;

const SummaryItem = styled.div`
  text-align: center;
  
  .label {
    font-size: 12px;
    color: #666;
    margin-bottom: 4px;
  }
  
  .value {
    font-size: 18px;
    font-weight: 600;
    color: #007BFF;
  }
`;

const BetForm = ({ playType, initialData, onBetUpdate, disabled }) => {
  const [betData, setBetData] = useState(null);
  const [mappings, setMappings] = useState(null);
  const [loading, setLoading] = useState(false);

  // 初始化投注数据
  useEffect(() => {
    if (initialData) {
      setBetData(initialData);
    } else {
      // 创建默认投注数据
      const defaultData = {
        playType,
        passType: '1x1',
        multiplier: 1,
        bets: []
      };
      setBetData(defaultData);
    }
  }, [initialData, playType]);

  // 加载玩法映射
  const loadMappings = async () => {
    try {
      const response = await api.get(`/api/bet/mappings/${playType}`);
      if (response.data.success) {
        setMappings(response.data.mappings);
      }
    } catch (error) {
      console.error('Load mappings error:', error);
      toast.error('加载玩法数据失败');
    }
  };

  useEffect(() => {
    loadMappings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playType]);

  // 数据更新时通知父组件
  useEffect(() => {
    if (betData && onBetUpdate) {
      calculateBetSummary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [betData, onBetUpdate]);

  // 计算投注统计
  const calculateBetSummary = async () => {
    if (!betData || !betData.bets || betData.bets.length === 0) {
      if (onBetUpdate) {
        onBetUpdate({ ...betData, totalBets: 0, totalAmount: 0 });
      }
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/api/bet/calculate', {
        playType: betData.playType,
        bets: betData.bets,
        multiplier: betData.multiplier
      });

      if (response.data.success) {
        const updatedData = {
          ...betData,
          totalBets: response.data.totalBets,
          totalAmount: response.data.totalAmount
        };
        
        setBetData(updatedData);
        if (onBetUpdate) {
          onBetUpdate(updatedData);
        }
      }
    } catch (error) {
      console.error('Calculate error:', error);
      toast.error('计算失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 更新基础信息
  const handleBasicInfoChange = (field, value) => {
    const updatedData = {
      ...betData,
      [field]: value
    };
    setBetData(updatedData);
  };

  // 添加投注项
  const addBet = () => {
    const newBet = createDefaultBet();
    const updatedData = {
      ...betData,
      bets: [...(betData.bets || []), newBet]
    };
    setBetData(updatedData);
  };

  // 创建默认投注项
  const createDefaultBet = () => {
    switch (playType) {
      case 'basketball':
        return {
          id: Date.now(),
          match: '周一001',
          type: 'SF',
          choice: '主胜'
        };
      case 'football':
        return {
          id: Date.now(),
          match: '周一001',
          type: 'SPF',
          choice: '主胜'
        };
      case 'dlt':
        return {
          id: Date.now(),
          type: 'multiple',
          front: ['05', '12', '23', '28', '35'],
          back: ['03', '08'],
          added: 0
        };
      case 'pls':
        return {
          id: Date.now(),
          type: 'single',
          numbers: ['1', '2', '3']
        };
      default:
        return { id: Date.now() };
    }
  };

  // 更新投注项
  const updateBet = (index, field, value) => {
    const updatedBets = [...(betData.bets || [])];
    updatedBets[index] = {
      ...updatedBets[index],
      [field]: value
    };
    
    const updatedData = {
      ...betData,
      bets: updatedBets
    };
    setBetData(updatedData);
  };

  // 删除投注项
  const removeBet = (index) => {
    const updatedBets = betData.bets.filter((_, i) => i !== index);
    const updatedData = {
      ...betData,
      bets: updatedBets
    };
    setBetData(updatedData);
  };

  // 获取玩法选项
  const getPlayTypeOptions = () => {
    if (!mappings || !mappings.mappings) return [];
    
    return Object.entries(mappings.mappings).map(([key, value]) => ({
      value: key,
      label: value.name
    }));
  };

  // 获取选项列表
  const getChoiceOptions = (playType) => {
    if (!mappings || !mappings.mappings || !mappings.mappings[playType]) {
      return [];
    }
    
    const playTypeData = mappings.mappings[playType];
    if (playTypeData.options) {
      return Object.entries(playTypeData.options).map(([key]) => ({
        value: key,
        label: key
      }));
    }
    
    return [];
  };

  // 渲染竞彩表单
  const renderSportsForm = () => {
    const columns = '100px 120px 120px 1fr 60px';
    
    return (
      <>
        <ControlRow>
          <ControlGroup>
            <Label>过关方式</Label>
            <Select
              value={betData?.passType || '1x1'}
              onChange={(e) => handleBasicInfoChange('passType', e.target.value)}
              disabled={disabled}
            >
              <option value="1x1">单关</option>
              <option value="2x1">2串1</option>
              <option value="3x1">3串1</option>
              <option value="4x1">4串1</option>
              <option value="5x1">5串1</option>
            </Select>
          </ControlGroup>
          
          <ControlGroup>
            <Label>倍数</Label>
            <Input
              type="number"
              min="1"
              max="999"
              value={betData?.multiplier || 1}
              onChange={(e) => handleBasicInfoChange('multiplier', parseInt(e.target.value) || 1)}
              disabled={disabled}
            />
          </ControlGroup>
        </ControlRow>

        <BetTable>
          <TableHeader columns={columns}>
            <div>场次</div>
            <div>玩法</div>
            <div>选项</div>
            <div>比分</div>
            <div>操作</div>
          </TableHeader>
          
          {(betData?.bets || []).map((bet, index) => (
            <TableRow key={bet.id || index} columns={columns}>
              <TableCell>
                <Input
                  value={bet.match || ''}
                  onChange={(e) => updateBet(index, 'match', e.target.value)}
                  placeholder="周XNNN"
                  disabled={disabled}
                />
              </TableCell>
              <TableCell>
                <Select
                  value={bet.type || ''}
                  onChange={(e) => updateBet(index, 'type', e.target.value)}
                  disabled={disabled}
                >
                  <option value="">选择玩法</option>
                  {getPlayTypeOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </TableCell>
              <TableCell>
                <Select
                  value={bet.choice || ''}
                  onChange={(e) => updateBet(index, 'choice', e.target.value)}
                  disabled={disabled}
                >
                  <option value="">选择选项</option>
                  {getChoiceOptions(bet.type).map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </TableCell>
              <TableCell>
                {bet.type === 'BIFEN' ? (
                  <Input
                    value={bet.choice || ''}
                    onChange={(e) => updateBet(index, 'choice', e.target.value)}
                    placeholder="如: 2:1"
                    disabled={disabled}
                  />
                ) : (
                  <span style={{ color: '#999' }}>-</span>
                )}
              </TableCell>
              <TableCell>
                <ActionButton
                  className="danger"
                  onClick={() => removeBet(index)}
                  disabled={disabled}
                  title="删除"
                >
                  <FaTrash />
                </ActionButton>
              </TableCell>
            </TableRow>
          ))}
        </BetTable>

        <AddButton onClick={addBet} disabled={disabled || loading}>
          <FaPlus />
          添加投注项
        </AddButton>
      </>
    );
  };

  // 渲染数字彩表单
  const renderNumberForm = () => {
    const bet = betData?.bets?.[0];
    if (!bet) return null;

    return (
      <>
        <ControlRow>
          <ControlGroup>
            <Label>倍数</Label>
            <Input
              type="number"
              min="1"
              max="999"
              value={betData?.multiplier || 1}
              onChange={(e) => handleBasicInfoChange('multiplier', parseInt(e.target.value) || 1)}
              disabled={disabled}
            />
          </ControlGroup>
          
          {playType === 'dlt' && (
            <ControlGroup>
              <Label>追加</Label>
              <Select
                value={bet.added || 0}
                onChange={(e) => updateBet(0, 'added', parseInt(e.target.value))}
                disabled={disabled}
              >
                <option value={0}>否</option>
                <option value={1}>是</option>
              </Select>
            </ControlGroup>
          )}
        </ControlRow>

        {playType === 'dlt' && (
          <ControlRow>
            <ControlGroup>
              <Label>前区号码 (5个)</Label>
              <Input
                value={bet.front?.join(', ') || ''}
                onChange={(e) => updateBet(0, 'front', e.target.value.split(',').map(n => n.trim()))}
                placeholder="如: 05, 12, 23, 28, 35"
                disabled={disabled}
              />
            </ControlGroup>
          </ControlRow>
        )}

        {playType === 'dlt' && (
          <ControlRow>
            <ControlGroup>
              <Label>后区号码 (2个)</Label>
              <Input
                value={bet.back?.join(', ') || ''}
                onChange={(e) => updateBet(0, 'back', e.target.value.split(',').map(n => n.trim()))}
                placeholder="如: 03, 08"
                disabled={disabled}
              />
            </ControlGroup>
          </ControlRow>
        )}

        {playType === 'pls' && (
          <ControlRow>
            <ControlGroup>
              <Label>号码</Label>
              <Input
                value={bet.numbers?.join(', ') || ''}
                onChange={(e) => updateBet(0, 'numbers', e.target.value.split(',').map(n => n.trim()))}
                placeholder="如: 1, 2, 3"
                disabled={disabled}
              />
            </ControlGroup>
          </ControlRow>
        )}
      </>
    );
  };

  if (!betData || !mappings) {
    return (
      <FormContainer>
        <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
          加载中...
        </div>
      </FormContainer>
    );
  }

  return (
    <FormContainer>
      <FormTitle>
        <FaEdit />
        投注单编辑
      </FormTitle>

      <FormContent>
        {playType === 'basketball' || playType === 'football' ? 
          renderSportsForm() : 
          renderNumberForm()
        }
      </FormContent>

      <SummaryRow>
        <SummaryItem>
          <div className="label">总注数</div>
          <div className="value">{betData.totalBets || 0}</div>
        </SummaryItem>
        <SummaryItem>
          <div className="label">总金额</div>
          <div className="value">¥{betData.totalAmount || 0}</div>
        </SummaryItem>
        <SummaryItem>
          <div className="label">状态</div>
          <div className="value" style={{ fontSize: '14px' }}>
            {loading ? '计算中...' : '已就绪'}
          </div>
        </SummaryItem>
      </SummaryRow>
    </FormContainer>
  );
};

export default BetForm;