from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.api.dependencies import get_current_user, get_comercial_user
from app.models.users import User
from app.models.contracts import Contract, BudgetItem
from app.schemas.contracts import (
    ContractCreate,
    ContractUpdate,
    ContractResponse,
    ContractDetailResponse,
    ContractListResponse
)

router = APIRouter()


@router.get("/", response_model=ContractListResponse)
async def list_contracts(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    cliente: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lista todos os contratos"""

    # Query base
    query = db.query(Contract)

    # Aplicar filtros
    if cliente:
        query = query.filter(Contract.cliente.ilike(f"%{cliente}%"))

    if status_filter:
        query = query.filter(Contract.status == status_filter)

    # Contar total antes da paginação
    total = query.count()

    # Aplicar paginação
    contracts = query.offset(skip).limit(limit).all()

    # Converter para response schema e calcular campos derivados
    contract_responses = []
    for contract in contracts:
        # Calcular valores derivados (por enquanto usando valores básicos)
        valor_realizado = float(contract.valor_original) * 0.6  # TODO: Calcular baseado em NFs
        saldo_contrato = float(contract.valor_original) - valor_realizado
        percentual_realizado = (valor_realizado / float(contract.valor_original)) * 100
        economia_obtida = float(contract.valor_original) * (float(contract.meta_reducao_percentual) / 100)

        contract_data = {
            "id": contract.id,
            "numero_contrato": contract.numero_contrato,
            "nome_projeto": contract.nome_projeto,
            "cliente": contract.cliente,
            "tipo_contrato": contract.tipo_contrato,
            "valor_original": contract.valor_original,
            "meta_reducao_percentual": contract.meta_reducao_percentual,
            "status": contract.status,
            "data_inicio": contract.data_inicio,
            "data_fim_prevista": contract.data_fim_prevista,
            "data_fim_real": contract.data_fim_real,
            "observacoes": contract.observacoes,
            "criado_por": contract.criado_por,
            "created_at": contract.created_at,
            "updated_at": contract.updated_at,
            "valor_realizado": valor_realizado,
            "saldo_contrato": saldo_contrato,
            "percentual_realizado": percentual_realizado,
            "economia_obtida": economia_obtida,
            "percentual_economia": (economia_obtida / float(contract.valor_original)) * 100 if contract.valor_original > 0 else 0
        }
        contract_responses.append(ContractResponse(**contract_data))

    return ContractListResponse(
        contracts=contract_responses,
        total=total,
        page=(skip // limit) + 1,
        per_page=limit
    )


@router.get("/{contract_id}", response_model=ContractDetailResponse)
async def get_contract(
    contract_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Detalhe de um contrato específico"""

    # Buscar contrato com itens do orçamento
    contract = db.query(Contract).filter(Contract.id == contract_id).first()

    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contrato não encontrado"
        )

    # Buscar itens do orçamento
    budget_items = db.query(BudgetItem).filter(BudgetItem.contract_id == contract_id).all()

    # Calcular valores derivados
    valor_realizado = float(contract.valor_original) * 0.6  # TODO: Calcular baseado em NFs
    saldo_contrato = float(contract.valor_original) - valor_realizado
    percentual_realizado = (valor_realizado / float(contract.valor_original)) * 100
    economia_obtida = float(contract.valor_original) * (float(contract.meta_reducao_percentual) / 100)

    contract_data = {
        "id": contract.id,
        "numero_contrato": contract.numero_contrato,
        "nome_projeto": contract.nome_projeto,
        "cliente": contract.cliente,
        "tipo_contrato": contract.tipo_contrato,
        "valor_original": contract.valor_original,
        "meta_reducao_percentual": contract.meta_reducao_percentual,
        "status": contract.status,
        "data_inicio": contract.data_inicio,
        "data_fim_prevista": contract.data_fim_prevista,
        "data_fim_real": contract.data_fim_real,
        "observacoes": contract.observacoes,
        "criado_por": contract.criado_por,
        "created_at": contract.created_at,
        "updated_at": contract.updated_at,
        "valor_realizado": valor_realizado,
        "saldo_contrato": saldo_contrato,
        "percentual_realizado": percentual_realizado,
        "economia_obtida": economia_obtida,
        "percentual_economia": (economia_obtida / contract.valor_original) * 100 if contract.valor_original > 0 else 0,
        "budget_items": budget_items
    }

    return ContractDetailResponse(**contract_data)


@router.post("/", response_model=ContractResponse)
async def create_contract(
    contract_data: ContractCreate,
    current_user: User = Depends(get_comercial_user),
    db: Session = Depends(get_db)
):
    """Criar novo contrato"""

    # Verificar se número do contrato já existe
    existing_contract = db.query(Contract).filter(
        Contract.numero_contrato == contract_data.numero_contrato
    ).first()

    if existing_contract:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Número do contrato já existe"
        )

    # Criar novo contrato
    new_contract = Contract(
        numero_contrato=contract_data.numero_contrato,
        nome_projeto=contract_data.nome_projeto,
        cliente=contract_data.cliente,
        tipo_contrato=contract_data.tipo_contrato,
        valor_original=contract_data.valor_original,
        meta_reducao_percentual=contract_data.meta_reducao_percentual,
        data_inicio=contract_data.data_inicio,
        data_fim_prevista=contract_data.data_fim_prevista,
        observacoes=contract_data.observacoes,
        criado_por=current_user.id
    )

    db.add(new_contract)
    db.commit()
    db.refresh(new_contract)

    # Criar itens do orçamento se fornecidos
    if contract_data.budget_items:
        for item_data in contract_data.budget_items:
            budget_item = BudgetItem(
                contract_id=new_contract.id,
                **item_data.dict()
            )
            db.add(budget_item)

        db.commit()

    # Calcular valores derivados
    valor_realizado = 0  # Novo contrato não tem realização
    saldo_contrato = new_contract.valor_original
    percentual_realizado = 0
    economia_obtida = 0

    contract_response_data = {
        "id": new_contract.id,
        "numero_contrato": new_contract.numero_contrato,
        "nome_projeto": new_contract.nome_projeto,
        "cliente": new_contract.cliente,
        "tipo_contrato": new_contract.tipo_contrato,
        "valor_original": new_contract.valor_original,
        "meta_reducao_percentual": new_contract.meta_reducao_percentual,
        "status": new_contract.status,
        "data_inicio": new_contract.data_inicio,
        "data_fim_prevista": new_contract.data_fim_prevista,
        "data_fim_real": new_contract.data_fim_real,
        "observacoes": new_contract.observacoes,
        "criado_por": new_contract.criado_por,
        "created_at": new_contract.created_at,
        "updated_at": new_contract.updated_at,
        "valor_realizado": valor_realizado,
        "saldo_contrato": saldo_contrato,
        "percentual_realizado": percentual_realizado,
        "economia_obtida": economia_obtida,
        "percentual_economia": 0
    }

    return ContractResponse(**contract_response_data)


@router.put("/{contract_id}", response_model=ContractResponse)
async def update_contract(
    contract_id: int,
    contract_data: ContractUpdate,
    current_user: User = Depends(get_comercial_user),
    db: Session = Depends(get_db)
):
    """Atualizar contrato"""

    # Buscar contrato
    contract = db.query(Contract).filter(Contract.id == contract_id).first()

    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contrato não encontrado"
        )

    # Atualizar campos fornecidos
    update_data = contract_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(contract, field, value)

    db.commit()
    db.refresh(contract)

    # Calcular valores derivados
    valor_realizado = float(contract.valor_original) * 0.6  # TODO: Calcular baseado em NFs
    saldo_contrato = float(contract.valor_original) - valor_realizado
    percentual_realizado = (valor_realizado / float(contract.valor_original)) * 100
    economia_obtida = float(contract.valor_original) * (float(contract.meta_reducao_percentual) / 100)

    contract_response_data = {
        "id": contract.id,
        "numero_contrato": contract.numero_contrato,
        "nome_projeto": contract.nome_projeto,
        "cliente": contract.cliente,
        "tipo_contrato": contract.tipo_contrato,
        "valor_original": contract.valor_original,
        "meta_reducao_percentual": contract.meta_reducao_percentual,
        "status": contract.status,
        "data_inicio": contract.data_inicio,
        "data_fim_prevista": contract.data_fim_prevista,
        "data_fim_real": contract.data_fim_real,
        "observacoes": contract.observacoes,
        "criado_por": contract.criado_por,
        "created_at": contract.created_at,
        "updated_at": contract.updated_at,
        "valor_realizado": valor_realizado,
        "saldo_contrato": saldo_contrato,
        "percentual_realizado": percentual_realizado,
        "economia_obtida": economia_obtida,
        "percentual_economia": (economia_obtida / contract.valor_original) * 100 if contract.valor_original > 0 else 0
    }

    return ContractResponse(**contract_response_data)


@router.delete("/{contract_id}")
async def delete_contract(
    contract_id: int,
    current_user: User = Depends(get_comercial_user),
    db: Session = Depends(get_db)
):
    """Excluir contrato"""

    # Buscar contrato
    contract = db.query(Contract).filter(Contract.id == contract_id).first()

    if not contract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contrato não encontrado"
        )

    # Excluir itens do orçamento primeiro (devido ao foreign key)
    db.query(BudgetItem).filter(BudgetItem.contract_id == contract_id).delete()

    # Excluir contrato
    db.delete(contract)
    db.commit()

    return {
        "message": f"Contrato {contract_id} excluído com sucesso"
    }


@router.get("/kpis")
async def get_contracts_kpis(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obter KPIs gerais dos contratos"""

    # Buscar todos os contratos ativos
    contracts = db.query(Contract).all()

    if not contracts:
        return {
            "totalValue": 0,
            "totalSpent": 0,
            "avgProgress": 0,
            "activeContracts": 0
        }

    total_value = sum(float(contract.valor_original) for contract in contracts)

    # Calcular valores estimados (TODO: usar dados reais de NFs)
    total_spent = total_value * 0.6  # 60% realizado em média
    avg_progress = 60.0  # Progresso médio estimado
    active_contracts = len([c for c in contracts if c.status == "ativo"])

    return {
        "totalValue": total_value,
        "totalSpent": total_spent,
        "avgProgress": avg_progress,
        "activeContracts": active_contracts
    }