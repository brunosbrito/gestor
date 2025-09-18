from pydantic import BaseModel, validator
from typing import List, Optional
from decimal import Decimal
from datetime import datetime
from app.models.contracts import ContractType, ContractStatus


class BudgetItemCreate(BaseModel):
    codigo_item: str
    descricao: str
    centro_custo: str
    unidade: Optional[str] = None
    quantidade_prevista: Optional[Decimal] = None
    peso_previsto: Optional[Decimal] = None
    valor_unitario_previsto: Optional[Decimal] = None
    valor_total_previsto: Decimal
    # Para serviços
    horas_normais_previstas: Optional[Decimal] = None
    horas_extras_previstas: Optional[Decimal] = None
    salario_previsto: Optional[Decimal] = None


class BudgetItemResponse(BudgetItemCreate):
    id: int
    contract_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ContractCreate(BaseModel):
    numero_contrato: str
    nome_projeto: str
    cliente: str
    tipo_contrato: ContractType
    valor_original: Decimal
    meta_reducao_percentual: Optional[Decimal] = Decimal('0')
    data_inicio: datetime
    data_fim_prevista: Optional[datetime] = None
    observacoes: Optional[str] = None
    budget_items: List[BudgetItemCreate] = []


class ContractUpdate(BaseModel):
    nome_projeto: Optional[str] = None
    cliente: Optional[str] = None
    valor_original: Optional[Decimal] = None
    meta_reducao_percentual: Optional[Decimal] = None
    status: Optional[ContractStatus] = None
    data_fim_prevista: Optional[datetime] = None
    data_fim_real: Optional[datetime] = None
    observacoes: Optional[str] = None


class ContractResponse(BaseModel):
    id: int
    numero_contrato: str
    nome_projeto: str
    cliente: str
    tipo_contrato: ContractType
    valor_original: Decimal
    meta_reducao_percentual: Decimal
    status: ContractStatus
    data_inicio: datetime
    data_fim_prevista: Optional[datetime] = None
    data_fim_real: Optional[datetime] = None
    observacoes: Optional[str] = None
    criado_por: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Campos calculados
    valor_realizado: Optional[Decimal] = None
    saldo_contrato: Optional[Decimal] = None
    percentual_realizado: Optional[Decimal] = None
    economia_obtida: Optional[Decimal] = None
    percentual_economia: Optional[Decimal] = None

    class Config:
        from_attributes = True


class ContractDetailResponse(ContractResponse):
    budget_items: List[BudgetItemResponse] = []


class ContractListResponse(BaseModel):
    contracts: List[ContractResponse]
    total: int
    page: int
    per_page: int