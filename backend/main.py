from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uvicorn

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./rmc_inventory.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class Material(Base):
    __tablename__ = "materials"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String)
    unit = Column(String)
    quantity = Column(Float)
    min_quantity = Column(Float)
    price = Column(Float)
    supplier = Column(String)
    location = Column(String)
    last_updated = Column(DateTime)

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(String, primary_key=True, index=True)
    material_id = Column(String)
    material_name = Column(String)
    type = Column(String)  # 'in' or 'out'
    quantity = Column(Float)
    reference = Column(String)
    supplier = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    date = Column(DateTime)
    user = Column(String)

class Supplier(Base):
    __tablename__ = "suppliers"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    contact_person = Column(String)
    email = Column(String)
    phone = Column(String)
    address = Column(String)
    materials = Column(String)  # JSON string of materials
    rating = Column(Float)
    active = Column(Boolean)

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)  # In production, use hashed passwords
    role = Column(String)
    name = Column(String)

# Create tables
Base.metadata.create_all(bind=engine)

# Pydantic models for API
class MaterialCreate(BaseModel):
    name: str
    category: str
    unit: str
    quantity: float
    min_quantity: float
    price: float
    supplier: str
    location: str

class MaterialUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    quantity: Optional[float] = None
    min_quantity: Optional[float] = None
    price: Optional[float] = None
    supplier: Optional[str] = None
    location: Optional[str] = None

class TransactionCreate(BaseModel):
    material_id: str
    material_name: str
    type: str
    quantity: float
    reference: str
    supplier: Optional[str] = None
    notes: Optional[str] = None
    user: str

class SupplierCreate(BaseModel):
    name: str
    contact_person: str
    email: str
    phone: str
    address: str
    materials: str
    rating: float
    active: bool

class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    materials: Optional[str] = None
    rating: Optional[float] = None
    active: Optional[bool] = None

class LoginRequest(BaseModel):
    username: str
    password: str

# FastAPI app
app = FastAPI(title="RMC Plant Inventory API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Initialize database with default data
def init_db():
    db = SessionLocal()
    
    # Check if data already exists
    if db.query(User).count() > 0:
        db.close()
        return
    
    # Create default users
    users = [
        User(id="1", username="admin", password="admin123", role="admin", name="Administrator"),
        User(id="2", username="operator", password="operator123", role="operator", name="Plant Operator")
    ]
    db.add_all(users)
    
    # Create default materials
    materials = [
        Material(
            id="1", name="OPC Cement", category="Cement", unit="MT",
            quantity=150.5, min_quantity=50, price=6500, supplier="CemCorp Industries",
            location="Warehouse A", last_updated=datetime.now()
        ),
        Material(
            id="2", name="M-Sand", category="Sand", unit="MT",
            quantity=280.0, min_quantity=100, price=800, supplier="Sand Suppliers Ltd",
            location="Storage Bay 1", last_updated=datetime.now()
        ),
        Material(
            id="3", name="20mm Aggregate", category="Aggregates", unit="MT",
            quantity=320.5, min_quantity=150, price=1200, supplier="Aggregate Co.",
            location="Storage Bay 2", last_updated=datetime.now()
        ),
        Material(
            id="4", name="12mm Aggregate", category="Aggregates", unit="MT",
            quantity=180.0, min_quantity=100, price=1150, supplier="Aggregate Co.",
            location="Storage Bay 2", last_updated=datetime.now()
        ),
        Material(
            id="5", name="Water", category="Water", unit="KL",
            quantity=45.5, min_quantity=20, price=50, supplier="Municipal Water",
            location="Water Tank", last_updated=datetime.now()
        ),
        Material(
            id="6", name="Superplasticizer", category="Admixtures", unit="Ltr",
            quantity=850.0, min_quantity=200, price=180, supplier="ChemBuild Solutions",
            location="Chemical Store", last_updated=datetime.now()
        ),
        Material(
            id="7", name="Retarder", category="Admixtures", unit="Ltr",
            quantity=420.0, min_quantity=150, price=165, supplier="ChemBuild Solutions",
            location="Chemical Store", last_updated=datetime.now()
        ),
        Material(
            id="8", name="Fly Ash", category="Supplementary", unit="MT",
            quantity=95.0, min_quantity=50, price=2500, supplier="Thermal Power Plant",
            location="Warehouse B", last_updated=datetime.now()
        ),
    ]
    db.add_all(materials)
    
    # Create default suppliers
    suppliers = [
        Supplier(
            id="1", name="CemCorp Industries", contact_person="Rajesh Kumar",
            email="rajesh@cemcorp.com", phone="+91 98765 43210",
            address="Plot 45, Industrial Area, Sector 8, Mumbai - 400001",
            materials='["Cement"]', rating=4.5, active=True
        ),
        Supplier(
            id="2", name="Sand Suppliers Ltd", contact_person="Priya Sharma",
            email="priya@sandsuppliers.com", phone="+91 98765 43211",
            address="River Side, Quarry Road, Pune - 411001",
            materials='["Sand"]', rating=4.2, active=True
        ),
        Supplier(
            id="3", name="Aggregate Co.", contact_person="Amit Patel",
            email="amit@aggregateco.com", phone="+91 98765 43212",
            address="Crusher Unit, NH-48, Vadodara - 390001",
            materials='["Aggregates"]', rating=4.8, active=True
        ),
        Supplier(
            id="4", name="ChemBuild Solutions", contact_person="Sneha Reddy",
            email="sneha@chembuild.com", phone="+91 98765 43213",
            address="Chemical Complex, GIDC Area, Ahmedabad - 380001",
            materials='["Admixtures"]', rating=4.6, active=True
        ),
        Supplier(
            id="5", name="Thermal Power Plant", contact_person="Vikram Singh",
            email="vikram@thermalpower.com", phone="+91 98765 43214",
            address="Power Plant Road, Industrial Zone, Nagpur - 440001",
            materials='["Fly Ash"]', rating=4.0, active=True
        ),
    ]
    db.add_all(suppliers)
    
    db.commit()
    db.close()

# API Routes

# Auth endpoints
@app.post("/api/auth/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.username == request.username,
        User.password == request.password
    ).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {
        "id": user.id,
        "username": user.username,
        "role": user.role,
        "name": user.name
    }

# Material endpoints
@app.get("/api/materials")
def get_materials(db: Session = Depends(get_db)):
    materials = db.query(Material).all()
    return materials

@app.get("/api/materials/{material_id}")
def get_material(material_id: str, db: Session = Depends(get_db)):
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    return material

@app.post("/api/materials")
def create_material(material: MaterialCreate, db: Session = Depends(get_db)):
    import uuid
    db_material = Material(
        id=str(uuid.uuid4()),
        **material.dict(),
        last_updated=datetime.now()
    )
    db.add(db_material)
    db.commit()
    db.refresh(db_material)
    return db_material

@app.put("/api/materials/{material_id}")
def update_material(material_id: str, material: MaterialUpdate, db: Session = Depends(get_db)):
    db_material = db.query(Material).filter(Material.id == material_id).first()
    if not db_material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    update_data = material.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_material, key, value)
    
    db_material.last_updated = datetime.now()
    db.commit()
    db.refresh(db_material)
    return db_material

@app.delete("/api/materials/{material_id}")
def delete_material(material_id: str, db: Session = Depends(get_db)):
    db_material = db.query(Material).filter(Material.id == material_id).first()
    if not db_material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    db.delete(db_material)
    db.commit()
    return {"message": "Material deleted successfully"}

# Transaction endpoints
@app.get("/api/transactions")
def get_transactions(db: Session = Depends(get_db)):
    transactions = db.query(Transaction).order_by(Transaction.date.desc()).all()
    return transactions

@app.post("/api/transactions")
def create_transaction(transaction: TransactionCreate, db: Session = Depends(get_db)):
    import uuid
    
    # Update material quantity
    material = db.query(Material).filter(Material.id == transaction.material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    if transaction.type == "in":
        material.quantity += transaction.quantity
    else:
        if material.quantity < transaction.quantity:
            raise HTTPException(status_code=400, detail="Insufficient stock")
        material.quantity -= transaction.quantity
    
    material.last_updated = datetime.now()
    
    # Create transaction
    db_transaction = Transaction(
        id=str(uuid.uuid4()),
        **transaction.dict(),
        date=datetime.now()
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

# Supplier endpoints
@app.get("/api/suppliers")
def get_suppliers(db: Session = Depends(get_db)):
    suppliers = db.query(Supplier).all()
    return suppliers

@app.get("/api/suppliers/{supplier_id}")
def get_supplier(supplier_id: str, db: Session = Depends(get_db)):
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier

@app.post("/api/suppliers")
def create_supplier(supplier: SupplierCreate, db: Session = Depends(get_db)):
    import uuid
    db_supplier = Supplier(
        id=str(uuid.uuid4()),
        **supplier.dict()
    )
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier

@app.put("/api/suppliers/{supplier_id}")
def update_supplier(supplier_id: str, supplier: SupplierUpdate, db: Session = Depends(get_db)):
    db_supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not db_supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    update_data = supplier.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_supplier, key, value)
    
    db.commit()
    db.refresh(db_supplier)
    return db_supplier

@app.delete("/api/suppliers/{supplier_id}")
def delete_supplier(supplier_id: str, db: Session = Depends(get_db)):
    db_supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not db_supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    db.delete(db_supplier)
    db.commit()
    return {"message": "Supplier deleted successfully"}

# Alerts endpoint
@app.get("/api/alerts")
def get_alerts(db: Session = Depends(get_db)):
    materials = db.query(Material).all()
    alerts = []
    
    for material in materials:
        if material.quantity <= material.min_quantity:
            severity = "critical" if material.quantity < material.min_quantity * 0.5 else "warning"
            alerts.append({
                "id": material.id,
                "material_id": material.id,
                "material_name": material.name,
                "category": material.category,
                "current_stock": material.quantity,
                "min_stock": material.min_quantity,
                "unit": material.unit,
                "severity": severity,
                "date": material.last_updated
            })
    
    return alerts

# Health check
@app.get("/")
def read_root():
    return {"message": "RMC Plant Inventory API", "status": "running"}

if __name__ == "__main__":
    print("Initializing database...")
    init_db()
    print("Starting FastAPI server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
