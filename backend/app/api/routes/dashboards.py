from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime
from app.core.database import get_db
from app.api.dependencies import get_current_user, get_suprimentos_user, get_diretoria_user
from app.models.users import User
from app.schemas.dashboards import SuppliesDashboard, ExecutiveDashboard, DashboardFilters
from app.services.dashboards_simple import SimpleDashboardService

router = APIRouter()


@router.get("/supplies", response_model=SuppliesDashboard)
async def get_supplies_dashboard(
    data_inicio: Optional[datetime] = Query(None, description="Data de início do filtro"),
    data_fim: Optional[datetime] = Query(None, description="Data de fim do filtro"),
    contract_ids: Optional[List[int]] = Query(None, description="IDs dos contratos para filtrar"),
    centro_custo: Optional[str] = Query(None, description="Centro de custo para filtrar"),
    current_user: User = Depends(get_suprimentos_user),
    db: Session = Depends(get_db)
):
    """
    Dashboard específico para a equipe de Suprimentos.
    Mostra métricas relacionadas a compras, cotações, fornecedores e economia.
    """
    filters = DashboardFilters(
        data_inicio=data_inicio,
        data_fim=data_fim,
        contract_ids=contract_ids,
        centro_custo=centro_custo
    )
    
    service = SimpleDashboardService(db)
    return service.get_supplies_dashboard(filters)


@router.get("/executive", response_model=ExecutiveDashboard)
async def get_executive_dashboard(
    data_inicio: Optional[datetime] = Query(None, description="Data de início do filtro"),
    data_fim: Optional[datetime] = Query(None, description="Data de fim do filtro"),
    contract_ids: Optional[List[int]] = Query(None, description="IDs dos contratos para filtrar"),
    cliente: Optional[str] = Query(None, description="Cliente para filtrar"),
    current_user: User = Depends(get_diretoria_user),
    db: Session = Depends(get_db)
):
    """
    Dashboard executivo para a Diretoria.
    Apresenta indicadores estratégicos, economia total, progresso dos contratos
    e oportunidades de otimização.
    """
    filters = DashboardFilters(
        data_inicio=data_inicio,
        data_fim=data_fim,
        contract_ids=contract_ids,
        cliente=cliente
    )
    
    service = SimpleDashboardService(db)
    return service.get_executive_dashboard(filters)


@router.get("/kpis/summary")
async def get_kpis_summary(
    contract_id: Optional[int] = Query(None, description="ID do contrato específico"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Resumo rápido dos principais KPIs.
    Disponível para todos os usuários autenticados.
    """
    filters = DashboardFilters(
        contract_ids=[contract_id] if contract_id else None
    )
    
    service = SimpleDashboardService(db)
    
    # Para usuários não-diretoria, retornar apenas métricas básicas
    if current_user.role.value != "diretoria" and current_user.role.value != "admin":
        supplies_dashboard = service.get_supplies_dashboard(filters)
        return {
            "total_ordens_compra": supplies_dashboard.total_ordens_compra,
            "economia_obtida": supplies_dashboard.economia_obtida,
            "fornecedores_aprovados": supplies_dashboard.total_fornecedores_aprovados
        }
    
    # Para diretoria, retornar KPIs estratégicos
    executive_dashboard = service.get_executive_dashboard(filters)
    return {
        "percentual_realizado_total": executive_dashboard.percentual_realizado_total,
        "economia_total": executive_dashboard.economia_total,
        "saldo_contratos_total": executive_dashboard.saldo_contratos_total,
        "meta_reducao_atingida": executive_dashboard.meta_reducao_atingida
    }


@router.get("/contracts/{contract_id}/metrics")
async def get_contract_specific_metrics(
    contract_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Métricas específicas de um contrato individual.
    Útil para widgets e cards específicos do contrato.
    """
    from app.services.contracts import ContractService
    
    contract_service = ContractService(db)
    contract = contract_service.get_contract_by_id(contract_id)
    
    if not contract:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contrato não encontrado"
        )
    
    metrics = contract_service.calculate_contract_metrics(contract_id)
    
    return {
        "contract_id": contract_id,
        "numero_contrato": contract.numero_contrato,
        "nome_projeto": contract.nome_projeto,
        "cliente": contract.cliente,
        "valor_original": contract.valor_original,
        "meta_reducao_percentual": contract.meta_reducao_percentual,
        **metrics
    }