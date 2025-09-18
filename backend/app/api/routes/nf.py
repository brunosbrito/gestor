"""Endpoints para gestão de Notas Fiscais"""

from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.api.dependencies import get_current_user, get_suprimentos_user
from app.models.users import User

router = APIRouter()


@router.get("/")
async def get_nfs(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    supplier: Optional[str] = Query(None),
    contract_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lista todas as notas fiscais"""

    # Mock data por enquanto
    mock_nfs = [
        {
            "id": 1,
            "number": "000123456",
            "series": "001",
            "supplier": "Fornecedor ABC Ltda",
            "contract": "Obra Residencial XYZ",
            "contract_id": 1,
            "value": 15000.50,
            "date": "2024-03-15",
            "status": "Pendente",
            "items": [
                {
                    "id": 1,
                    "description": "Cimento CP-II-32",
                    "quantity": 100,
                    "unitValue": 28.50,
                    "totalValue": 2850.00,
                    "unit": "sc",
                    "weight": 5000.0
                }
            ]
        },
        {
            "id": 2,
            "number": "000123457",
            "series": "001",
            "supplier": "Materiais Silva S.A.",
            "contract": "Construção Comercial ABC",
            "contract_id": 2,
            "value": 8750.30,
            "date": "2024-03-16",
            "status": "Validada",
            "items": [
                {
                    "id": 2,
                    "description": "Vergalhão 10mm",
                    "quantity": 50,
                    "unitValue": 175.00,
                    "totalValue": 8750.00,
                    "unit": "un",
                    "weight": 500.0
                }
            ]
        }
    ]

    # Aplicar filtros básicos
    filtered_nfs = mock_nfs

    if status_filter:
        filtered_nfs = [nf for nf in filtered_nfs if nf["status"].lower() == status_filter.lower()]

    if supplier:
        filtered_nfs = [nf for nf in filtered_nfs if supplier.lower() in nf["supplier"].lower()]

    if contract_id:
        filtered_nfs = [nf for nf in filtered_nfs if nf["contract_id"] == contract_id]

    # Paginação
    total = len(filtered_nfs)
    start = skip
    end = skip + limit
    paginated_nfs = filtered_nfs[start:end]

    return {
        "nfs": paginated_nfs,
        "total": total,
        "page": skip // limit + 1,
        "per_page": limit
    }


@router.get("/stats")
async def get_nf_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Estatísticas das notas fiscais"""

    return {
        "total_nfs": 12,
        "pending_validation": 3,
        "validated": 8,
        "rejected": 1,
        "total_value": 156750.80,
        "monthly_stats": [
            {"month": "Jan", "count": 4, "value": 45200.30},
            {"month": "Feb", "count": 3, "value": 38150.25},
            {"month": "Mar", "count": 5, "value": 73400.25}
        ],
        "status_distribution": {
            "Pendente": 3,
            "Validada": 8,
            "Rejeitada": 1
        }
    }


@router.get("/{nf_id}")
async def get_nf(
    nf_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Detalhe de uma nota fiscal específica"""

    if nf_id == 1:
        return {
            "id": 1,
            "number": "000123456",
            "series": "001",
            "supplier": "Fornecedor ABC Ltda",
            "contract": "Obra Residencial XYZ",
            "contract_id": 1,
            "value": 15000.50,
            "date": "2024-03-15",
            "status": "Pendente",
            "xmlFile": "nf_123456.xml",
            "pdfFile": "nf_123456.pdf",
            "items": [
                {
                    "id": 1,
                    "description": "Cimento CP-II-32",
                    "quantity": 100,
                    "unitValue": 28.50,
                    "totalValue": 2850.00,
                    "unit": "sc",
                    "weight": 5000.0,
                    "ncm": "25232910",
                    "budgetItemId": "item_001",
                    "costCenterId": "materia_prima",
                    "classificationScore": 95.5,
                    "classificationSource": "ai"
                }
            ]
        }
    else:
        raise HTTPException(status_code=404, detail="Nota fiscal não encontrada")


@router.post("/")
async def create_nf(
    nf_data: dict,
    current_user: User = Depends(get_suprimentos_user),
    db: Session = Depends(get_db)
):
    """Criar nova nota fiscal"""

    # Mock response
    return {
        "id": 999,
        "number": nf_data.get("number", "NEW123"),
        "series": nf_data.get("series", "001"),
        "supplier": nf_data.get("supplier", "Novo Fornecedor"),
        "value": nf_data.get("value", 0),
        "date": datetime.now().isoformat(),
        "status": "Pendente",
        "message": "Nota fiscal criada com sucesso"
    }


@router.put("/{nf_id}")
async def update_nf(
    nf_id: int,
    nf_data: dict,
    current_user: User = Depends(get_suprimentos_user),
    db: Session = Depends(get_db)
):
    """Atualizar nota fiscal"""

    return {
        "id": nf_id,
        "message": "Nota fiscal atualizada com sucesso",
        "updated_fields": list(nf_data.keys())
    }


@router.patch("/{nf_id}/validate")
async def validate_nf(
    nf_id: int,
    current_user: User = Depends(get_suprimentos_user),
    db: Session = Depends(get_db)
):
    """Validar nota fiscal"""

    return {
        "id": nf_id,
        "status": "Validada",
        "validated_by": current_user.full_name,
        "validated_at": datetime.now().isoformat(),
        "message": "Nota fiscal validada com sucesso"
    }


@router.patch("/{nf_id}/reject")
async def reject_nf(
    nf_id: int,
    reason: str,
    current_user: User = Depends(get_suprimentos_user),
    db: Session = Depends(get_db)
):
    """Rejeitar nota fiscal"""

    return {
        "id": nf_id,
        "status": "Rejeitada",
        "rejected_by": current_user.full_name,
        "rejected_at": datetime.now().isoformat(),
        "reason": reason,
        "message": "Nota fiscal rejeitada"
    }


@router.post("/import")
async def import_nf(
    file: UploadFile = File(...),
    contract_id: Optional[int] = None,
    current_user: User = Depends(get_suprimentos_user),
    db: Session = Depends(get_db)
):
    """Importar nota fiscal de arquivo XML"""

    if not file.filename:
        raise HTTPException(status_code=400, detail="Arquivo não fornecido")

    if not file.filename.endswith('.xml'):
        raise HTTPException(status_code=400, detail="Apenas arquivos XML são aceitos")

    # Mock import process
    return {
        "success": True,
        "message": f"Arquivo {file.filename} importado com sucesso",
        "nf": {
            "id": 998,
            "number": "IMPORTED001",
            "series": "001",
            "supplier": "Fornecedor Importado",
            "value": 12500.00,
            "items": 5,
            "contract_id": contract_id
        }
    }


@router.delete("/{nf_id}")
async def delete_nf(
    nf_id: int,
    current_user: User = Depends(get_suprimentos_user),
    db: Session = Depends(get_db)
):
    """Excluir nota fiscal"""

    return {
        "message": f"Nota fiscal {nf_id} excluída com sucesso"
    }