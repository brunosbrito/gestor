from sqlalchemy import Column, Integer, String, Numeric, DateTime, Enum, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class ContractType(str, enum.Enum):
    MATERIAL_PRODUTO = "material_produto"
    SERVICO = "servico"


class ContractStatus(str, enum.Enum):
    ATIVO = "ativo"
    CONCLUIDO = "concluido"
    CANCELADO = "cancelado"
    SUSPENSO = "suspenso"


class Contract(Base):
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True, index=True)
    numero_contrato = Column(String, unique=True, index=True, nullable=False)
    nome_projeto = Column(String, nullable=False)
    cliente = Column(String, nullable=False)
    tipo_contrato = Column(String, nullable=False)
    valor_original = Column(Numeric(15, 2), nullable=False)
    meta_reducao_percentual = Column(Numeric(5, 2), default=0)  # Percentual de redução esperado
    status = Column(String, default="ativo")
    data_inicio = Column(DateTime(timezone=True), nullable=False)
    data_fim_prevista = Column(DateTime(timezone=True))
    data_fim_real = Column(DateTime(timezone=True))
    observacoes = Column(Text)
    criado_por = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    creator = relationship("User", foreign_keys=[criado_por])
    budget_items = relationship("BudgetItem", back_populates="contract")
    purchase_orders = relationship("PurchaseOrder", back_populates="contract")


class BudgetItem(Base):
    __tablename__ = "budget_items"

    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id"), nullable=False)
    codigo_item = Column(String, nullable=False)
    descricao = Column(Text, nullable=False)
    centro_custo = Column(String, nullable=False)
    unidade = Column(String)
    quantidade_prevista = Column(Numeric(15, 4))
    peso_previsto = Column(Numeric(15, 4))
    valor_unitario_previsto = Column(Numeric(15, 2))
    valor_total_previsto = Column(Numeric(15, 2), nullable=False)
    # Para serviços
    horas_normais_previstas = Column(Numeric(10, 2))
    horas_extras_previstas = Column(Numeric(10, 2))
    salario_previsto = Column(Numeric(15, 2))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    contract = relationship("Contract", back_populates="budget_items")