import React, { useState, useEffect } from "react";
import axios from "axios";
import './services/hola.css';

const InvoiceForm = () => {
  const VITE_API_URL = "https://api-sandbox.factus.com.co";
  const VITE_CLIENT_ID = "9de1c9f0-587d-4947-8527-fb9da3569ccb";
  const VITE_CLIENT_SECRET = "NMsRZTjRU9eREQhzJKCqr46y1UD8OPMOfxoV3AaN";
  const VITE_EMAIL = "sandbox@factus.com.co";
  const VITE_PASSWORD = "sandbox2024%";

  const [formData, setFormData] = useState({
    numbering_range_id: 8,
    reference_code: "",
    observation: "",
    payment_form: "1",
    payment_due_date: "2024-12-30",
    payment_method_code: "10",
    billing_period: {
      start_date: "2024-01-10",
      start_time: "00:00:00",
      end_date: "2024-02-09",
      end_time: "23:59:59",
    },
    customer: {
      identification: "",
      dv: "",
      company: "",
      trade_name: "",
      names: "",
      address: "",
      email: "",
      phone: "",
      legal_organization_id: "2",
      tribute_id: "21",
      identification_document_id: "3",
      municipality_id: "980",
    },
    items: [
      {
        code_reference: "",
        name: "",  
        quantity: 1,
        discount_rate: 0,
        price: 0,
        tax_rate: "19.00",
        unit_measure_id: 70,
        standard_code_id: 1,
        is_excluded: 0,
        tribute_id: 1,
        withholding_taxes: [],
      },
    ],
  });

  const [numberingRanges, setNumberingRanges] = useState([]);
  const [products, setProducts] = useState([]);
  const [measurementUnits, setMeasurementUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const tokenResponse = await axios.post(
          `${VITE_API_URL}/oauth/token`,
          {
            grant_type: "password",
            client_id: VITE_CLIENT_ID,
            client_secret: VITE_CLIENT_SECRET,
            username: VITE_EMAIL,
            password: VITE_PASSWORD,
          },
          { headers: { Accept: "application/json" } }
        );
        const token = tokenResponse.data.access_token;

        const numberingRangesResponse = await axios.get(
          `${VITE_API_URL}/v1/numbering-ranges`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNumberingRanges(numberingRangesResponse.data.data);

        const productsResponse = await axios.get(
          `${VITE_API_URL}/v1/tributes/products?name=`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProducts(productsResponse.data.data);

        const unitsResponse = await axios.get(
          `${VITE_API_URL}/v1/measurement-units?name=`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMeasurementUnits(unitsResponse.data.data);
      } catch (error) {
        console.error("Error al obtener datos:", error);
        alert("Error al obtener datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      customer: { ...prev.customer, [name]: value },
    }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedItems = [...prev.items];
      updatedItems[index] = { ...updatedItems[index], [name]: value };
      return { ...prev, items: updatedItems };
    });
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          code_reference: "",
          name: "", 
          quantity: 1,
          discount_rate: 0,
          price: 0,
          tax_rate: "19.00",
          unit_measure_id: 70,
          standard_code_id: 1,
          is_excluded: 0,
          tribute_id: 1,
          withholding_taxes: [],
        },
      ],
    }));
  };

  const handleRemoveItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };





  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Enviando datos de la factura:", formData);
  
    try {
      const tokenResponse = await axios.post(
        `${VITE_API_URL}/oauth/token`,
        {
          grant_type: "password",
          client_id: VITE_CLIENT_ID,
          client_secret: VITE_CLIENT_SECRET,
          username: VITE_EMAIL,
          password: VITE_PASSWORD,
        },
        { headers: { Accept: "application/json" } }
      );
      const accessToken = tokenResponse.data.access_token;
  
      // Validar y crear la factura
      try {
        const validateCreateResponse = await axios.post(
          `${VITE_API_URL}/v1/bills/validate`,
          formData,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        console.log("Factura creada y validada:", validateCreateResponse.data);
  
        // Obtener el número de la factura
        const { status, message, number, cufe, pdf_base_64_encoded, file_name } = validateCreateResponse.data;
  
        // Mostrar un mensaje de éxito
        alert(`Factura creada exitosamente!\nStatus: ${status}\nMensaje: ${message}\nCUFE: ${cufe}`);
  
        // Decodificar el PDF en base64 y descargarlo
        const decodedPdf = atob(pdf_base_64_encoded); // Decodifica el Base64
  
        // Crear un Blob del PDF decodificado
        const blob = new Blob([new Uint8Array([...decodedPdf].map((char) => char.charCodeAt(0)))], {
          type: 'application/pdf',
        });
  
        // Crear un enlace de descarga
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = file_name; // El nombre del archivo PDF
        downloadLink.click(); // Simula el clic para iniciar la descarga
  
        // Enviar la factura a la DIAN
        try {
          const sendResponse = await axios.post(
            `${VITE_API_URL}/v1/bills/send/${number}`,
            {}, // El cuerpo de la solicitud puede ir vacío o con los parámetros requeridos
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          console.log("Factura enviada a la DIAN:", sendResponse.data);
          alert("Factura enviada exitosamente a la DIAN.");
        } catch (sendError) {
          console.error("Error al enviar la factura a la DIAN:", sendError.response.data);
          alert("Error al enviar la factura a la DIAN.");
        }
      } catch (validationError) {
        if (validationError.response) {
          console.error("Error al crear y validar la factura:", validationError.response.data);
          alert(
            `Error al crear y validar la factura: ${validationError.response.data.message || "Error desconocido"}`
          );
        } else {
          console.error("Error desconocido al crear y validar la factura:", validationError);
          alert("Error desconocido durante la validación de la factura");
        }
      }
    } catch (authError) {
      console.error("Error de autenticación:", authError);
      alert("Error al obtener el token de autenticación. Por favor, revisa tus credenciales.");
    }
  };
  
  
  return (
    <form onSubmit={handleSubmit}>
      <h2>Crear Factura</h2>

      {/* Campo Reference Code */}
      <div>
        <label>Código de Referencia:</label>
        <input
          type="text"
          name="reference_code"
          value={formData.reference_code}
          onChange={handleChange}
        />
      </div>

      {/* Campo Observación */}
      <div>
        <label>Observación:</label>
        <input
          type="text"
          name="observation"
          value={formData.observation}
          onChange={handleChange}
        />
      </div>




      {/* Rango de Numeración */}
      <div>
        <label>Rango de Numeración:</label>
        <select
          name="numbering_range_id"
          value={formData.numbering_range_id}
          onChange={handleChange}
        >
          {numberingRanges.map((range) => (
            <option key={range.id} value={range.id}>
              {range.document} - {range.prefix} ({range.from} - {range.to})
            </option>
          ))}
        </select>
      </div>




      {/* Información del Cliente */}
      <div>
        <label>Identificación del Cliente:</label>
        <input
          type="text"
          name="identification"
          value={formData.customer.identification}
          onChange={handleCustomerChange}
        />
      </div>
      <div>
        <label>Nombre del Cliente:</label>
        <input
          type="text"
          name="names"
          value={formData.customer.names}
          onChange={handleCustomerChange}
        />
      </div>
      <div>
        <label>Dirección:</label>
        <input
          type="text"
          name="address"
          value={formData.customer.address}
          onChange={handleCustomerChange}
        />
      </div>
      <div>
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.customer.email}
          onChange={handleCustomerChange}
        />
      </div>
      <div>
        <label>Teléfono:</label>
        <input
          type="text"
          name="phone"
          value={formData.customer.phone}
          onChange={handleCustomerChange}
        />
      </div>



      {/* Campos de Productos (Items) */}
      {formData.items.map((item, index) => (
        <div key={index}>
          <h3>Producto {index + 1}</h3>
          <div>
            <label>Referencia:</label>
            <input
              type="text"
              name="code_reference"
              value={item.code_reference}
              onChange={(e) => handleItemChange(index, e)}
            />
          </div>
          
          <div>
            <label>Unidad de Medida:</label>
            <select
              name="unit_measure_id"
              value={item.unit_measure_id}
              onChange={(e) => handleItemChange(index, e)}
            >
              {measurementUnits.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Nombre:</label>
            <input
              type="text"
              name="name"
              value={item.name}
              onChange={(e) => handleItemChange(index, e)}
            />
          </div>
          <div>
            <label>Cantidad:</label>
            <input
              type="number"
              name="quantity"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, e)}
            />
          </div>
          <div>
            <label>Precio:</label>
            <input
              type="number"
              name="price"
              value={item.price}
              onChange={(e) => handleItemChange(index, e)}
            />
          </div>
          <div>
            <label>IVA:</label>
            <select
              name="tax_rate"
              value={item.tax_rate}
              onChange={(e) => handleItemChange(index, e)}
            >
              <option value="19.00">19%</option>
              <option value="0.00">Exento</option>
            </select>
          </div>
          <button type="button" onClick={() => handleRemoveItem(index)}>
            Eliminar Producto
          </button>
        </div>
      ))}

      {/* Botón para agregar otro producto */}
      <button type="button" onClick={handleAddItem}>
        Agregar Producto
      </button>

      {/* Botón de envío */}
      <button type="submit" disabled={loading}>
        {loading ? "Creando..." : "Crear Factura"}
      </button>
    </form>
  );
};

export default InvoiceForm;
