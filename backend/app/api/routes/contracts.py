from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status, Query, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.api.dependencies import get_current_user, get_comercial_user
from app.models.users import User
from app.models.contracts import Contract, BudgetItem, ValorPrevisto
from app.models.purchases import Invoice, PurchaseOrder
from sqlalchemy import func
from app.schemas.contracts import (
    ContractCreate,
    ContractUpdate,
    ContractResponse,
    ContractDetailResponse,
    ContractListResponse,
    ValorPrevistoResponse
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
        # Calcular valor realizado baseado nas invoices reais

        valor_realizado = db.query(func.sum(Invoice.valor_total)).join(
            PurchaseOrder
        ).filter(PurchaseOrder.contract_id == contract.id).scalar() or 0
        valor_realizado = float(valor_realizado)
        saldo_contrato = float(contract.valor_original) - valor_realizado
        percentual_realizado = (valor_realizado / float(contract.valor_original)) * 100
        economia_obtida = float(contract.valor_original) * (float(contract.meta_reducao_percentual) / 100)

        
        # Map database fields to frontend-compatible schema
        # Ensure we have safe values for nullable fields
        safe_name = contract.nome_projeto if contract.nome_projeto else "Projeto sem nome"
        safe_client = contract.cliente if contract.cliente else "Cliente não informado"
        safe_contract_type = contract.tipo_contrato if contract.tipo_contrato else "material"
        safe_status = contract.status if contract.status else "Em Andamento"

        contract_data = {
            "id": contract.id,
            "name": safe_name,  # nome_projeto -> name
            "client": safe_client,  # cliente -> client
            "contractType": safe_contract_type,  # tipo_contrato -> contractType
            "value": contract.valor_original,  # Keep as Decimal
            "spent": Decimal(str(valor_realizado)),  # Convert to Decimal
            "progress": Decimal(str(percentual_realizado)),  # Convert to Decimal
            "status": safe_status,
            "startDate": contract.data_inicio,  # Keep as datetime object
            "endDate": contract.data_fim_real,  # Keep as datetime object

            # Optional backend fields
            "numero_contrato": contract.numero_contrato,
            "meta_reducao_percentual": contract.meta_reducao_percentual,
            "data_fim_prevista": contract.data_fim_prevista,
            "observacoes": contract.observacoes,
            "criado_por": contract.criado_por,
            "created_at": contract.created_at,
            "updated_at": contract.updated_at,
            "hasBudgetImport": len(contract.budget_items) > 0 if hasattr(contract, 'budget_items') else False
        }
        contract_responses.append(ContractResponse(**contract_data))

    return ContractListResponse(
        contracts=contract_responses,
        total=total,
        page=(skip // limit) + 1,
        per_page=limit
    )


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
            "data": {
                "totalValue": 0,
                "totalSpent": 0,
                "avgProgress": 0,
                "activeContracts": 0
            }
        }

    total_value = sum(float(contract.valor_original) for contract in contracts)

    # Calcular valores estimados (TODO: usar dados reais de NFs)
    total_spent = total_value * 0.6  # 60% realizado em média
    avg_progress = 60.0  # Progresso médio estimado
    active_contracts = len([c for c in contracts if c.status == "Em Andamento"])

    return {
        "data": {
            "totalValue": total_value,
            "totalSpent": total_spent,
            "avgProgress": avg_progress,
            "activeContracts": active_contracts
        }
    }


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

    # Buscar valores previstos (orçamento previsto)
    valores_previstos = db.query(ValorPrevisto).filter(ValorPrevisto.contract_id == contract_id).all()

    # Calcular valores derivados
    valor_realizado = float(contract.valor_original) * 0.6  # TODO: Calcular baseado em NFs
    saldo_contrato = float(contract.valor_original) - valor_realizado
    percentual_realizado = (valor_realizado / float(contract.valor_original)) * 100
    economia_obtida = float(contract.valor_original) * (float(contract.meta_reducao_percentual) / 100)

    
    # Map database fields to frontend-compatible schema
    contract_data = {
        "id": contract.id,
        "name": contract.nome_projeto,  # nome_projeto -> name
        "client": contract.cliente,  # cliente -> client
        "contractType": contract.tipo_contrato,  # tipo_contrato -> contractType
        "value": contract.valor_original,  # Keep as Decimal
        "spent": Decimal(str(valor_realizado)),  # Convert to Decimal
        "progress": Decimal(str(percentual_realizado)),  # Convert to Decimal
        "status": contract.status,
        "startDate": contract.data_inicio,  # Keep as datetime object
        "endDate": contract.data_fim_real,  # Keep as datetime object

        # Optional backend fields
        "numero_contrato": contract.numero_contrato,
        "meta_reducao_percentual": contract.meta_reducao_percentual,
        "data_fim_prevista": contract.data_fim_prevista,
        "observacoes": contract.observacoes,
        "criado_por": contract.criado_por,
        "created_at": contract.created_at,
        "updated_at": contract.updated_at,
        "hasBudgetImport": len(budget_items) > 0,
        "budget_items": budget_items,
        "valores_previstos": valores_previstos
    }

    return ContractDetailResponse(**contract_data)


@router.post("/", response_model=ContractResponse)
async def create_contract(
    name: str = Form(...),
    client: str = Form(...),
    contractType: str = Form(...),
    startDate: str = Form(...),
    description: str = Form(None),
    qqp_file: UploadFile = File(..., description="Arquivo QQP_Cliente obrigatório"),
    current_user: User = Depends(get_comercial_user),
    db: Session = Depends(get_db)
):
    """Criar novo contrato com arquivo QQP_Cliente obrigatório"""

    # Processar arquivo QQP_Cliente primeiro para extrair valor e itens
    from app.services.import_service import DataImportService

    import_service = DataImportService(db)
    try:
        # Processar arquivo sem contract_id (para extração)
        import_result = await import_service.import_budget_from_excel(
            file=qqp_file,
            contract_id=None,  # Não salvar ainda
            sheet_name="QQP_Cliente"
        )

        if not import_result['success']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao processar arquivo QQP_Cliente: {import_result['errors']}"
            )

        # Extrair valor total do contrato
        valor_original = import_result['contract_total_value']
        if not valor_original:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não foi possível extrair o valor total do contrato do arquivo QQP_Cliente"
            )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erro ao processar arquivo QQP_Cliente: {str(e)}"
        )

    # Generate contract number automatically
    import time
    import random
    numero_contrato = f"CONT-{int(time.time())}-{random.randint(1000, 9999)}"

    # Converter startDate de string para datetime
    from datetime import datetime
    start_date_obj = datetime.fromisoformat(startDate)

    # Criar contrato com valor extraído do arquivo
    new_contract = Contract(
        numero_contrato=numero_contrato,
        nome_projeto=name,  # name -> nome_projeto
        cliente=client,  # client -> cliente
        tipo_contrato=contractType,  # contractType -> tipo_contrato
        valor_original=valor_original,  # Valor extraído do QQP_Cliente
        meta_reducao_percentual=0,  # Default value
        data_inicio=start_date_obj,  # startDate -> data_inicio
        data_fim_prevista=None,
        observacoes=description,  # description -> observacoes
        criado_por=current_user.id
    )

    db.add(new_contract)
    db.commit()
    db.refresh(new_contract)

    # Processar arquivo novamente para salvar os itens do orçamento
    try:
        # Reset file position
        await qqp_file.seek(0)

        # Importar com contract_id para salvar no banco
        final_import = await import_service.import_budget_from_excel(
            file=qqp_file,
            contract_id=new_contract.id,
            sheet_name="QQP_Cliente"
        )

        if not final_import['success']:
            # Se falhar, deletar contrato criado
            db.delete(new_contract)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao salvar itens do orçamento: {final_import['errors']}"
            )

    except Exception as e:
        # Se falhar, deletar contrato criado
        db.delete(new_contract)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erro ao processar orçamento: {str(e)}"
        )

    # Calcular valores derivados
    valor_realizado = Decimal('0')  # Novo contrato não tem realização
    percentual_realizado = Decimal('0')

    
    # Map database fields to frontend-compatible schema
    contract_response_data = {
        "id": new_contract.id,
        "name": new_contract.nome_projeto,  # nome_projeto -> name
        "client": new_contract.cliente,  # cliente -> client
        "contractType": new_contract.tipo_contrato,  # tipo_contrato -> contractType
        "value": new_contract.valor_original,  # Valor extraído do QQP_Cliente
        "spent": valor_realizado,  # Já é Decimal
        "progress": percentual_realizado,  # Já é Decimal
        "status": new_contract.status,
        "startDate": new_contract.data_inicio,  # Keep as datetime object
        "endDate": new_contract.data_fim_real,  # Keep as datetime object

        # Optional backend fields
        "numero_contrato": new_contract.numero_contrato,
        "meta_reducao_percentual": new_contract.meta_reducao_percentual,
        "data_fim_prevista": new_contract.data_fim_prevista,
        "observacoes": new_contract.observacoes,
        "criado_por": new_contract.criado_por,
        "created_at": new_contract.created_at,
        "updated_at": new_contract.updated_at,
        "hasBudgetImport": True  # Sempre true pois arquivo QQP é obrigatório
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

    
    # Map database fields to frontend-compatible schema
    contract_response_data = {
        "id": contract.id,
        "name": contract.nome_projeto,  # nome_projeto -> name
        "client": contract.cliente,  # cliente -> client
        "contractType": contract.tipo_contrato,  # tipo_contrato -> contractType
        "value": contract.valor_original,  # Keep as Decimal
        "spent": Decimal(str(valor_realizado)),  # Convert to Decimal
        "progress": Decimal(str(percentual_realizado)),  # Convert to Decimal
        "status": contract.status,
        "startDate": contract.data_inicio,  # Keep as datetime object
        "endDate": contract.data_fim_real,  # Keep as datetime object

        # Optional backend fields
        "numero_contrato": contract.numero_contrato,
        "meta_reducao_percentual": contract.meta_reducao_percentual,
        "data_fim_prevista": contract.data_fim_prevista,
        "observacoes": contract.observacoes,
        "criado_por": contract.criado_por,
        "created_at": contract.created_at,
        "updated_at": contract.updated_at,
        "hasBudgetImport": len(contract.budget_items) > 0 if hasattr(contract, 'budget_items') else False
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