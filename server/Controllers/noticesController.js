import sql from 'mssql';

const NoticesController = {};

NoticesController.getLeadSuppliers = async (req, res) => {
    try {
        const query = `Select 
            LeadSuppliers.Name, 
            LeadSuppliers.LeadSupplierID AS ID
        From LeadSuppliers
        Where LeadSuppliers.CompanyID =  1  AND LeadSuppliers.LeadActive =  'Y'  Order By LeadSuppliers.Name`

        const result = await sql.query(query)
        const LeadSuppliers = result.recordset

        res.json(LeadSuppliers)
    } catch (err) {
        console.error(err);  // Para poder ver el error detallado en la consola del servidor
        res.status(400).json({ message: "No ha sido posible obtener los proveedores" })
    }
};

NoticesController.getStatus = async (req, res) => {
    try {
        const query = `Select Status.Name, Status.StatusID AS ID, Status.RequiredFields, GroupID, GroupName
                        From Status
                        Where Status.CallCenterFilter =  1
                        Order By Status.StatusID`

        const result = await sql.query(query)
        const Status = result.recordset

        res.json(Status)
    } catch (err) {
        res.status(400).json({ message: "No ha sido posible obtener los estados" })
    }
};

NoticesController.getReasons = async (req, res) => {
    try {
        const query = `Select Reason, ReasonID
        from Reasons
        where StatusID = 20
        `
        const result = await sql.query(query)
        const Reasons = result.recordset

        res.json(Reasons)
    } catch (error) {
        res.status(400).json({ message: "No ha sido posible obtener las razones" })
    }
}

NoticesController.getBrands = async (req, res) => {
    try {
        const query = `Select Brands.Name, Brands.BrandID AS ID, Brands.UrlLogo
                        From Brands 
                        Order By Brands.Name`

        const result = await sql.query(query)
        const Brands = result.recordset

        res.json(Brands)
    } catch (err) {
        res.status(400).json({ message: "No ha sido posible obtener las marcas" })
    }
};

NoticesController.getApparatus = async (req, res) => {
    try {
        const checkProductfamily = req.query.checkProductfamily === 'true';

        if (checkProductfamily) {
            const query = `SELECT Apparatus.Name, Apparatus.ApparatusID AS ID
            FROM Apparatus WHERE ProductFamilyID = 10 AND ApparatusID <> 35 ORDER BY Apparatus.Name`

            const result = await sql.query(query)
            const Apparatus = result.recordset

            res.json(Apparatus)
        } else {
            const query = `SELECT Apparatus.Name, Apparatus.ApparatusID AS ID
            FROM Apparatus WHERE ProductFamilyID NOT IN (10) ORDER BY Apparatus.Name`

            const result = await sql.query(query)
            const Apparatus = result.recordset

            res.json(Apparatus)
        }
    } catch (err) {
        res.status(400).json({ message: "No ha sido posible obtener los aparatos" })
    }
};

NoticesController.getTypes = async (req, res) => {
    const { apparatusID } = req.query

    try {
        const query = `select 
                Types.TYPE AS Name, 
                Types.TypeID AS ID
            from Types
            where Types.ApparatusID = ${apparatusID}
            ORDER BY Types.TYPE
        `
        const result = await sql.query(query)

        if (result.recordset.length > 0) {
            const Type = result.recordset

            res.json(Type)
        } else {
            res.json([])
        }

    } catch (err) {
        res.status(400).json({ message: "No ha sido posible obtener los tipos" })
    }
};

NoticesController.getPrefixes = async (req, res) => {
    try {
        const query = `Select 
                            PhoneCodes.CountryName, 
                            PhoneCodes.PhoneCodesID 
                        From PhoneCodes 
                        Order By PhoneCodes.CountryName
        `
        const result = await sql.query(query)
        const questions0 = result.recordset
        res.json({ questions0 })
    } catch (err) {
        res.status(400).json({ message: "No ha sido posible obtener los prefijos" })
    }
};

NoticesController.getCustomer = async (req, res) => {
    const { cell } = req.body
    try {
        const query = `
            SELECT Customers.CustomerID
            FROM Customers
            WHERE Customers.Cell = '${cell}' OR Customers.Phone = '${cell}'`

        const result = await sql.query(query)
        if (result.recordset.length == 0) {
            res.send('Cliente no encontrado')
        } else {
            const customer = result.recordset[0]
            res.json({ customer })
        }

    } catch (err) {
        res.status(400).json({ message: "error al consultar cliente" })
    }
};

// getCustomersByExternaID
NoticesController.getCustomersByExternalID = async (req, res) => {
    const { externalID } = req.params;

    return res.status(200).json({ message: `${externalID}` })

    if (!externalID) {
        return res.status(400).json({ message: "ID externo no proporcionado", customers: [] });
    }

    try {
        const query = `
            SELECT Customers.CustomerID, Customers.Name, Customers.Cell, Customers.Phone, Customers.Address, Customers.City, Customers.ZipCode, Customers.Email
            FROM Customers
            WHERE Customers.EnteredBy = '${externalID}'`;

        const result = await sql.query(query);

        if (result.recordset.length === 0) {
            // Devolver un array vacío en lugar de un mensaje de texto
            return res.status(200).json([]);
        } else {
            res.status(200).json(result.recordset);
        }

    } catch (err) {
        // Devolver un objeto de error en formato JSON
        res.status(400).json({ message: "Error al consultar clientes", error: err.message });
    }
}

NoticesController.getDataCustomer = async (req, res) => {
    const { cell } = req.query
    try {
        const dataCustomer = (await sql.query(`
            SELECT *
            FROM Customers
            WHERE Cell = '${cell}' OR Phone = '${cell}'`)).recordset[0]

        const deliveryAddress = (await sql.query(`
            SELECT 
                c.CustomerID,
                c.Name AS CustomerName,
                c.Cell AS CustomerCell,
                c.Phone AS CustomerPhone,
                da.Observation,
                da.DeliveryAddressID,
                da.Address AS DeliveryAddress,
                da.Cell AS DeliveryCell,
                da.Phone AS DeliveryPhone
            FROM Customers c
            LEFT JOIN DeliveryAddress da ON da.CustomerID = c.CustomerID
            WHERE 
                c.Cell LIKE '${cell}' OR
                c.Phone LIKE '${cell}' OR
                da.Cell LIKE '${cell}' OR
                da.Phone LIKE '${cell}'`)).recordset[0]

        // res.status(200).json(dataCustomer)
        res.status(200).json({ dataCustomer, deliveryAddress })
    } catch (err) {
        res.status(400).json({ message: "error al consultar cliente" })
    }
};

NoticesController.createCustomer = async (req, res) => {
    const { customer } = req.body;
    const customerCoordinates = `${customer.lat},${customer.lng}`;
    const customerAddress = `${customer.calle} ${customer.numero}`;
    console.log("Customer", customer);
    // validateCustomerData(customer);
    try {
        const request = new sql.Request();

        // Agregar parámetros
        request.input('address', sql.NVarChar, customerAddress.toUpperCase() || null);
        request.input('addressNext', sql.NVarChar, customer.piso.toUpperCase() || null);
        request.input('alias', sql.NVarChar, `${customer.nombre} ${customer.apellido1} ${customer.apellido2}`.toUpperCase());
        request.input('cell', sql.NVarChar, customer.movil);
        request.input('city', sql.NVarChar, customer.poblacion.toUpperCase());
        request.input('dni', sql.NVarChar, customer.dni.toUpperCase() || null);
        request.input('email', sql.NVarChar, customer.email.toUpperCase() || null);
        request.input('name', sql.NVarChar, customer.nombre.toUpperCase() || 'N/S');
        request.input('phone', sql.NVarChar, customer.telefono || null);
        request.input('secondSurname', sql.NVarChar, customer.apellido2.toUpperCase() || null);
        request.input('surname', sql.NVarChar, customer.apellido1.toUpperCase() || null);
        request.input('zipCode', sql.NVarChar, customer.cp);
        request.input('enteredBy', sql.NVarChar, customer.enteredBy.toString() || 'System');
        // Coordinates
        // request.input('coordinates', sql.NVarChar, `${customer.lat},${customer.lng}`);
        request.input('coordinates', sql.NVarChar, customerCoordinates || null);
        request.input('country', sql.NVarChar, customer.pais.toUpperCase() || 'ESPAÑA');
        request.input('DeliverSameAddress', sql.Int, 1);
        request.input('InvoiceSameAddress', sql.Int, 1);
        request.input('state', sql.NVarChar, customer.comunidadAutonoma.toUpperCase() || null);

        const query = `
        DECLARE @NewCustomerID TABLE (CustomerID INT);

        INSERT INTO Customers (
            Address, AddressNext, Alias, Cell, City, CompanyID, 
            Coordinates, Country, DeliverSameAddress, DNI, Email,
            EnteredBy, InputDate, InvoiceModificated, InvoiceSameAddress,
            ModifiedBy, Name, Phone, PhoneCodesID, SecondSurname,
            State, Surname, ToRecall, ZipCode
        )
        OUTPUT INSERTED.CustomerID INTO @NewCustomerID
        VALUES (
            @address, @addressNext, @alias, @cell, @city, 1,
            @coordinates, @country, @DeliverSameAddress, @dni, @email,
            @enteredBy, GETDATE(), '', @InvoiceSameAddress,
            @enteredBy, @name, @phone, '', @secondSurname,
            @state, @surname, 0, @zipCode
        );

        SELECT CustomerID FROM @NewCustomerID;`;

        const result = await request.query(query);
        res.json({
            message: "Cliente creado correctamente",
            customerId: result.recordset[0].CustomerID
        });

        // console.log("Creating customer...");
    } catch (err) {
        console.error("Error al crear cliente:", err);
        res.status(400).json({
            message: "No ha sido posible crear el cliente",
            error: err.message
        });
    }
}

NoticesController.updateCustomer = async (req, res) => {
    const { customer } = req.body;
    console.log("Customer to update", customer);
    // return

    if (!customer.customerId) {
        return res.status(400).json({
            message: "El ID del cliente es requerido"
        });
    }

    try {
        const request = new sql.Request();

        // Agregar parámetros con validación
        request.input('address', sql.NVarChar, customer.calle || '');
        request.input('addressNext', sql.NVarChar, customer.piso || '');
        request.input('alias', sql.NVarChar, `${customer.nombre.toUpperCase() || ''} ${customer.apellido1.toUpperCase() || ''} ${customer.apellido2.toUpperCase() || ''}`);
        request.input('cell', sql.NVarChar, customer.movil || '');
        request.input('city', sql.NVarChar, customer.poblacion || '');
        request.input('dni', sql.NVarChar, customer.dni || '');
        request.input('email', sql.NVarChar, customer.email || '');
        request.input('name', sql.NVarChar, customer.nombre.toUpperCase() || '');
        request.input('phone', sql.NVarChar, customer.telefono || '');
        request.input('secondSurname', sql.NVarChar, customer.apellido2.toUpperCase() || '');
        request.input('surname', sql.NVarChar, customer.apellido1.toUpperCase() || '');
        request.input('zipCode', sql.NVarChar, customer.cp || '');
        request.input('customerID', sql.Int, parseInt(customer.customerId));
        request.input('coordinates', sql.NVarChar, customer.coordenadas || '');
        request.input('deliverSameAddress', sql.Int, customer.deliverySameAddress || 1);
        request.input('invoiceSameAddress', sql.Int, customer.invoiceSameAddress || 1);
        request.input('toRecall', sql.Int, customer.toRecall || 0);
        request.input('modifiedBy', sql.NVarChar, customer.modifiedBy.toString() || 'System');

        const query = `
        UPDATE Customers
        SET 
            Address = @address,
            AddressNext = @addressNext,
            Alias = @alias,
            Cell = @cell,
            City = @city,
            DNI = @dni,
            Email = @email,
            Name = @name,
            Phone = @phone,
            SecondSurname = @secondSurname,
            Surname = @surname,
            ZipCode = @zipCode,
            Coordinates = @coordinates,
            DeliverSameAddress = @deliverSameAddress,
            InvoiceSameAddress = @invoiceSameAddress,
            ToRecall = @toRecall,
            ModifiedBy = @modifiedBy
        WHERE CustomerID = @customerID;
        
        SELECT @@ROWCOUNT as affected;`;

        const result = await request.query(query);
        const rowsAffected = result.recordset[0].affected;

        if (rowsAffected === 0) {
            return res.status(404).json({
                message: "No se encontró el cliente o no se realizaron cambios"
            });
        }

        res.json({
            message: "Cliente actualizado correctamente",
            rowsAffected
        });
    } catch (err) {
        console.error("Error al actualizar cliente:", err);
        res.status(400).json({
            message: "No ha sido posible actualizar el cliente",
            error: err.message
        });
    }
}

NoticesController.getZIPCodes = async (req, res) => {
    try {
        const { zipCode } = req.query
        const query = `SELECT *
    from ZipCodes
    where ZipCodes.ZipCode = '${zipCode}'`
        const result = await sql.query(query)
        const data = result.recordset[0]

        res.json(data)


    } catch (err) {
        res.status(400).json({ message: "error al consultar cliente" })
    }
}

NoticesController.createCustomer = async (req, res) => {
    const { customer } = req.body;
    const customerCoordinates = `${customer.lat},${customer.lng}`;
    const customerAddress = `${customer.calle} ${customer.numero}`;
    console.log("Customer", customer);
    try {
        const request = new sql.Request();

        request.input('address', sql.NVarChar, customerAddress.toUpperCase() || 'SIN DIRECCIÓN');
        request.input('addressNext', sql.NVarChar, customer.piso.toUpperCase() || 'N/A');
        request.input('alias', sql.NVarChar, `${customer.nombre} ${customer.apellido1} ${customer.apellido2}`.toUpperCase());
        request.input('cell', sql.NVarChar, customer.movil || customer.telefono);
        request.input('city', sql.NVarChar, customer.poblacion.toUpperCase() || 'N/A');
        request.input('dni', sql.NVarChar, customer.dni.toUpperCase() || 'N/A');
        request.input('email', sql.NVarChar, customer.email.toUpperCase() || 'no@email.com');
        request.input('name', sql.NVarChar, customer.nombre.toUpperCase() || 'N/S');
        request.input('phone', sql.NVarChar, customer.telefono);
        request.input('secondSurname', sql.NVarChar, customer.apellido2.toUpperCase() || 'N/A');
        request.input('surname', sql.NVarChar, customer.apellido1.toUpperCase() || 'N/A');
        request.input('zipCode', sql.NVarChar, customer.cp || '00000');
        request.input('enteredBy', sql.NVarChar, customer.enteredBy.toString() || 'System');
        request.input('coordinates', sql.NVarChar, customerCoordinates || '0,0');
        request.input('country', sql.NVarChar, customer.pais.toUpperCase() || 'ESPAÑA');
        request.input('DeliverSameAddress', sql.Int, 1);
        request.input('InvoiceSameAddress', sql.Int, 1);
        request.input('state', sql.NVarChar, customer.comunidadAutonoma.toUpperCase() || 'N/A');

        const query = `
        DECLARE @NewCustomerID TABLE (CustomerID INT);

        INSERT INTO Customers (
            Address, AddressNext, Alias, Cell, City, CompanyID, 
            Coordinates, Country, DeliverSameAddress, DNI, Email,
            EnteredBy, InputDate, InvoiceModificated, InvoiceSameAddress,
            ModifiedBy, Name, Phone, PhoneCodesID, SecondSurname,
            State, Surname, ToRecall, ZipCode
        )
        OUTPUT INSERTED.CustomerID INTO @NewCustomerID
        VALUES (
            @address, @addressNext, @alias, @cell, @city, 1,
            @coordinates, @country, @DeliverSameAddress, @dni, @email,
            @enteredBy, GETDATE(), '', @InvoiceSameAddress,
            @enteredBy, @name, @phone, '', @secondSurname,
            @state, @surname, 0, @zipCode
        );

        SELECT CustomerID FROM @NewCustomerID;`;

        const result = await request.query(query);
        res.json({
            message: "Cliente creado correctamente",
            customerId: result.recordset[0].CustomerID
        });

    } catch (err) {
        console.error("Error al crear cliente:", err);
        res.status(400).json({
            message: "No ha sido posible crear el cliente",
            error: err.message
        });
    }
};

NoticesController.openSatNotice = async (req, res) => {
    try {
        const { LoginID, notice } = req.body;

        await sql.query(`UPDATE NoticeHeader SET AutomaticLead = 2, LoginID = ${LoginID} WHERE NoticeHeaderID = ${notice.NoticeHeaderID}`)

        res.status(200).json({ message: "ok" })
    } catch (error) {
        console.error(error);
    }
}

NoticesController.getStatusActions = async (req, res) => {
    try {
        const actions = (await sql.query(`SELECT * FROM StatusActions ORDER BY StatusID, ActionName`)).recordset;

        res.status(200).json(actions);
    } catch (error) {
        console.error('Error al obtener acciones de contextMenu:', error);
        res.status(400).json({ message: "Error al obtener acciones de contextMenu" });
    }
};

NoticesController.insertExternalNotice = async (req, res) => {
    console.log("Inserting external notice...");
    try {
        const { notice } = req.body;
        console.log("Notice data:", notice);

        // return res.status(200).json({ message: "Notice data received" });
        // First, check if a customer exists with the given phone number
        const request = new sql.Request();
        request.input('phone', sql.NVarChar, notice.telefono);

        const checkCustomerQuery = `
            SELECT CustomerID, Name, Phone 
            FROM Customers 
            WHERE Phone = @phone OR Cell = @phone`;

        const customerResult = await request.query(checkCustomerQuery);

        let customerId;

        if (customerResult.recordset.length === 0) {
            // No customer found, create a new one
            const customerData = {
                nombre: notice.nombre.toUpperCase() || 'Sin Nombre',
                apellido1: notice.apellido.toUpperCase() || 'N/A',
                apellido2: notice.segundoApellido.toUpperCase() || 'N/A',
                telefono: notice.telefono,
                movil: notice.telefono, // Using main phone as cell
                calle: notice.direccion.toUpperCase() || 'Sin Dirección',
                numero: 'S/N',
                piso: notice.pisoPuerta.toUpperCase() || 'N/A',
                cp: notice.cp || '00000',
                poblacion: notice.poblacion.toUpperCase() || 'N/A',
                provincia: notice.provincia || 'N/A',
                pais: 'ESPAÑA',
                dni: 'N/A',
                email: notice.email.toUpperCase() || 'no@email.com',
                lat: notice.lat || '0',
                lng: notice.lng || '0',
                // enteredBy: notice.externalLoginID.toString() || 'ExternalSystem',
                enteredBy: notice.externalInvoicingAddressID.toString() || 'ExternalSystem',
            };

            const createCustomerRequest = new sql.Request();
            const customerAddress = customerData.calle;
            const customerAlias = `${customerData.nombre} ${customerData.apellido1}`.trim();

            createCustomerRequest.input('address', sql.NVarChar, customerAddress.toUpperCase());
            createCustomerRequest.input('addressNext', sql.NVarChar, customerData.piso.toUpperCase());
            createCustomerRequest.input('alias', sql.NVarChar, customerAlias.toUpperCase());
            createCustomerRequest.input('cell', sql.NVarChar, customerData.movil);
            createCustomerRequest.input('city', sql.NVarChar, customerData.poblacion.toUpperCase());
            createCustomerRequest.input('dni', sql.NVarChar, customerData.dni.toUpperCase());
            createCustomerRequest.input('email', sql.NVarChar, customerData.email.toUpperCase());
            createCustomerRequest.input('name', sql.NVarChar, customerData.nombre.toUpperCase());
            createCustomerRequest.input('phone', sql.NVarChar, customerData.telefono);
            createCustomerRequest.input('secondSurname', sql.NVarChar, customerData.apellido2.toUpperCase());
            createCustomerRequest.input('surname', sql.NVarChar, customerData.apellido1.toUpperCase());
            createCustomerRequest.input('zipCode', sql.NVarChar, customerData.cp);
            createCustomerRequest.input('enteredBy', sql.NVarChar, customerData.enteredBy);
            createCustomerRequest.input('coordinates', sql.NVarChar, `${customerData.lat},${customerData.lng}`);
            createCustomerRequest.input('country', sql.NVarChar, customerData.pais.toUpperCase());
            createCustomerRequest.input('DeliverSameAddress', sql.Int, 1);
            createCustomerRequest.input('InvoiceSameAddress', sql.Int, 1);
            createCustomerRequest.input('state', sql.NVarChar, customerData.provincia || 'N/A');

            const createCustomerQuery = `
            DECLARE @NewCustomerID TABLE (CustomerID INT);

            INSERT INTO Customers (
                Address, AddressNext, Alias, Cell, City, CompanyID, 
                Coordinates, Country, DeliverSameAddress, DNI, Email,
                EnteredBy, InputDate, InvoiceModificated, InvoiceSameAddress,
                ModifiedBy, Name, Phone, PhoneCodesID, SecondSurname,
                State, Surname, ToRecall, ZipCode
            )
            OUTPUT INSERTED.CustomerID INTO @NewCustomerID
            VALUES (
                @address, @addressNext, @alias, @cell, @city, 1,
                @coordinates, @country, @DeliverSameAddress, @dni, @email,
                @enteredBy, GETDATE(), '', @InvoiceSameAddress,
                @enteredBy, @name, @phone, '', @secondSurname,
                @state, @surname, 0, @zipCode
            );

            SELECT CustomerID FROM @NewCustomerID;`;

            const newCustomerResult = await createCustomerRequest.query(createCustomerQuery);
            customerId = newCustomerResult.recordset[0].CustomerID;
            console.log("Created new customer with ID:", customerId);
        } else {
            customerId = customerResult.recordset[0].CustomerID;
            console.log("Found existing customer with ID:", customerId);
        }

        // Create the notice by calling the external API

        // return res.status(200).json({ success: true, message: "Notice processed successfully" });

        const noticeData = {
            data: {
                cell: notice.telefono,
                name: notice.nombre,
                address: notice.direccion,
                city: notice.poblacion || 'N/A',
                zipcode: notice.cp,
                phone: notice.telefono,
                email: notice.email || 'no@email.com',
                apparatus: notice.aparato,
                brand: notice.marca,
                model: notice.modelo,
                // Observaciones tecnicas
                observations: notice.comentarioAveria.toUpperCase() || 'N/A',
                // Añadir observaciones del cliente
                customerObservations: notice.comentario.toUpperCase() || 'N/A',
                ex_cell: notice.ex_cell,
                servicetypeid: notice.servicetypeid,
                externalLoginID: notice.externalLoginID,
                externalInvoicingAddressID: notice.externalInvoicingAddressID,
            }
        };

        // console.log("Notice Data to API:", noticeData.data);

        // return res.status(200).json({ success: true, message: "Notice processed successfully" });

        const apiResponse = await fetch('https://externos.itcmadicloud.com/ex_functions/new-notice', {
            // const apiResponse = await fetch('http://192.168.0.88:3999/ex_functions/new-notice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(noticeData)
        });

        console.log("API Response:", apiResponse.status, apiResponse.statusText);

        if (!apiResponse.ok) {
            throw new Error(`API call failed with status: ${apiResponse.status}`);
        }

        const apiResult = await apiResponse.json();

        res.json({
            success: true,
            message: "External notice processed",
            customerId: customerId,
            noticeResult: apiResult
        });

    } catch (error) {
        console.error("Error inserting external notice:", error);
        res.status(500).json({
            success: false,
            message: "Error inserting external notice",
            error: error.message
        });
    }
};

// Endpoint to get Ex_InvoicingAddress by Email
NoticesController.getEx_InvoicingAddressByEmail = async (req, res) => {
    try {
        const { email } = req.query;
        console.log("Email to search:", email);

        const request = new sql.Request();
        request.input('email', sql.NVarChar, email);

        const query = `
            SELECT * FROM Ex_InvoicingAddress WHERE Email = @email
        `;

        const result = await request.query(query);
        console.log("Result:", result.recordset);

        res.json(result.recordset);
    } catch (error) {
        console.error("Error fetching Ex_InvoicingAddress:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching Ex_InvoicingAddress",
            error: error.message
        });
    }
};

NoticesController.updateFiscalData = async (req, res) => {
    try {
        const {
            tipo,
            tipoDocumento,
            nombreFiscal,
            nombre,
            primerApellido,
            segundoApellido,
            direccion,
            telefonoMovil,
            telefonoFijo,
            correoElectronico,
            numeroFiscal,
            codigoPostal,
            ciudad,
            provincia,
            iban
        } = req.body;

        console.log('IBAN:', iban);

        // Si tipo es 'autonomo', asignar el valor de 0
        const tipoValue = tipo === 'autonomo' ? 0 : 1;

        const request = new sql.Request();

        // Add input parameters
        request.input('TaxName', sql.NVarChar, nombreFiscal?.toUpperCase());
        request.input('Name', sql.NVarChar, nombre?.toUpperCase());
        request.input('Surname', sql.NVarChar, primerApellido?.toUpperCase());
        request.input('SecondSurname', sql.NVarChar, segundoApellido?.toUpperCase());
        request.input('Address', sql.NVarChar, direccion?.toUpperCase());
        request.input('Cell', sql.NVarChar, telefonoMovil);
        request.input('Phone', sql.NVarChar, telefonoFijo);
        request.input('Email', sql.NVarChar, correoElectronico?.toUpperCase());
        request.input('TaxIDNumber', sql.NVarChar, numeroFiscal?.toUpperCase());
        request.input('ZipCode', sql.NVarChar, codigoPostal);
        request.input('City', sql.NVarChar, ciudad?.toUpperCase());
        request.input('Province', sql.NVarChar, provincia?.toUpperCase());
        request.input('OldEmail', sql.NVarChar, correoElectronico?.toUpperCase());
        request.input('DocumentTypeID', sql.Int, tipoDocumento);
        request.input('Business', sql.Int, tipoValue);
        request.input('IBAN', sql.NVarChar, iban?.toUpperCase() || null); // Add Iban parameter

        // Update Ex_InvoicingAddress
        const updateInvoicingQuery = `
            UPDATE Ex_InvoicingAddress
            SET 
                TaxName = @TaxName,
                Name = @Name,
                Surname = @Surname,
                SecondSurname = @SecondSurname,
                Address = @Address,
                Cell = @Cell,
                Phone = @Phone,
                Email = @Email,
                TaxIDNumber = @TaxIDNumber,
                ZipCode = @ZipCode,
                City = @City,
                Province = @Province,
                DocumentTypeID = @DocumentTypeID,
                Business = @Business,
                IBAN = @IBAN
            WHERE Email = @OldEmail;
            
            SELECT @@ROWCOUNT as UpdatedRows;
        `;

        const invoicingResult = await request.query(updateInvoicingQuery);

        if (invoicingResult.recordset[0].UpdatedRows > 0) {
            // Update Ex_Login
            const updateLoginQuery = `
                UPDATE Ex_Login
                SET 
                    Name = @Name,
                    Surname = @Surname,
                    SecondSurname = @SecondSurname,
                    Cell = @Cell,
                    Phone = @Phone,
                    Address = @Address,
                    Email = @Email,
                    City = @City,
                    ZipCode = @ZipCode
                WHERE Email = @OldEmail;
                
                SELECT @@ROWCOUNT as UpdatedRows;
            `;

            const loginResult = await request.query(updateLoginQuery);

            if (loginResult.recordset[0].UpdatedRows > 0) {
                res.json({
                    success: true,
                    message: "Datos fiscales y de login actualizados correctamente"
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: "Error al actualizar los datos de login"
                });
            }
        } else {
            res.status(404).json({
                success: false,
                message: "No se encontró el registro de facturación para actualizar"
            });
        }

    } catch (error) {
        console.error("Error updating fiscal data:", error);
        res.status(500).json({
            success: false,
            message: "Error al actualizar los datos",
            error: error.message
        });
    }
};

NoticesController.getNoticesByExternalLoginID = async (req, res) => {
    const { externalLoginID } = req.params; // Changed from req.query to req.params
    // console.log("ExternalLoginID:", externalLoginID);

    try {
        const request = new sql.Request();
        request.input('ExternalLoginID', sql.Int, externalLoginID);

        // const result = await request.query(`
        //      SELECT 
        //         en.ExternalNoticeID,
        //         en.NoticeHeaderID,
        //         en.ExternalLoginID,
        //         en.Ex_StatusID,
        //         nh.ReasonID,
        //         nh.LoginID,
        //         nh.LeadSupplierID,
        //         nh.InvoicingAddressID,
        //         nh.StatusID,
        //         nh.CustomerID,
        //         nh.CreateDate,
        //         nh.ModifyDate,
        //         nh.Observation,
        //         nh.TechnicalObservation,
        //         nh.CompanyID,
        //         nh.Invoice,
        //         nh.TechnicID,
        //         nh.ApparatusID,
        //         nh.BrandID,
        //         nh.TypeID,
        //         c.Name as CustomerName,
        //         c.Surname as CustomerSurname,
        //         c.Address as CustomerAddress,
        //         c.City as CustomerCity,
        //         c.ZipCode as CustomerZipCode,
        //         c.Phone as CustomerPhone,
        //         c.Cell as CustomerCell,
        //         c.Email as CustomerEmail
        //     FROM Ex_Notices en
        //     JOIN NoticeHeader nh ON en.NoticeHeaderID = nh.NoticeHeaderID
        //     LEFT JOIN Customers c ON nh.CustomerID = c.CustomerID
        //     WHERE en.ExternalLoginID = @ExternalLoginID
        //     ORDER BY nh.CreateDate DESC;
        // `);

        const result = await request.query(`
            SELECT 
                en.ExternalNoticeID,
                en.NoticeHeaderID,
                en.ExternalLoginID,
                en.Ex_StatusID,
                nh.ReasonID,
                nh.LoginID,
                nh.LeadSupplierID,
                nh.InvoicingAddressID,
                nh.StatusID,
                nh.CustomerID,
                nh.CreateDate,
                nh.ModifyDate,
                nh.Observation,
                nh.TechnicalObservation,
                nh.CompanyID,
                nh.Invoice,
                nh.TechnicID,
                nh.ApparatusID,
                nh.BrandID,
                nh.TypeID,
                c.Name as CustomerName,
                c.Surname as CustomerSurname,
                c.Address as CustomerAddress,
                c.City as CustomerCity,
                c.ZipCode as CustomerZipCode,
                c.Phone as CustomerPhone,
                c.Cell as CustomerCell,
                c.Email as CustomerEmail,
                a.Name as ApparatusName
            FROM Ex_Notices en
            JOIN NoticeHeader nh ON en.NoticeHeaderID = nh.NoticeHeaderID
            LEFT JOIN Customers c ON nh.CustomerID = c.CustomerID
            LEFT JOIN Apparatus a ON nh.ApparatusID = a.ApparatusID
            WHERE en.ExternalLoginID = @ExternalLoginID
            ORDER BY nh.CreateDate DESC;
        `);

        res.json(result.recordset);
    } catch (err) {
        console.error('Error al obtener los avisos:', err);
        res.status(500).json({
            error: 'Error al obtener los avisos',
            details: err.message
        });
    }
};

NoticesController.getNoticesByEx_InvoicingAddressID = async (req, res) => {
    try {
        const { Ex_InvoicingAddressID } = req.params;

        const request = new sql.Request();
        request.input('Ex_InvoicingAddressID', sql.Int, Ex_InvoicingAddressID);

        // Primero obtenemos los datos del usuario para saber si es administrador
        const userQuery = `
            SELECT ExternalLoginID, Administrator
            FROM Ex_Login
            WHERE Ex_InvoicingAddressID = @Ex_InvoicingAddressID
        `;

        const userResult = await request.query(userQuery);
        const user = userResult.recordset[0];

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const isAdministrator = Boolean(user.Administrator);
        const externalLoginID = user.ExternalLoginID;

        let query = `
                SELECT DISTINCT
                    nh.NoticeHeaderID,
                    nh.CreateDate,
                    nh.ModifyDate,
                    nh.Observation,
                    nh.TechnicalObservation,
                    nh.StatusID,
                    nh.CustomerID,
                    nh.ApparatusID,
                    nh.BrandID,
                    nh.TypeID,
                    nh.ServiceTypeID,
                    c.Name as CustomerName,
                    c.Surname as CustomerSurname,
                    c.Address as CustomerAddress,
                    c.City as CustomerCity,
                    c.Phone as CustomerPhone,
                    c.Cell as CustomerCell,
                    a.Name as ApparatusName,
                    b.Name as BrandName,
                    t.Type as TypeName,
                    s.Name as StatusName,
                    en.ExternalLoginID,
                    en.Ex_StatusID,
                    el.Administrator,
                    eia.TaxName as CustomerTaxName
                FROM NoticeHeader nh
                LEFT JOIN Customers c ON nh.CustomerID = c.CustomerID
                LEFT JOIN Apparatus a ON nh.ApparatusID = a.ApparatusID
                LEFT JOIN Brands b ON nh.BrandID = b.BrandID
                LEFT JOIN Types t ON nh.TypeID = t.TypeID
                LEFT JOIN Status s ON nh.StatusID = s.StatusID
                LEFT JOIN Ex_Notices en ON nh.NoticeHeaderID = en.NoticeHeaderID
                LEFT JOIN Ex_Login el ON en.ExternalLoginID = el.ExternalLoginID
                LEFT JOIN Ex_InvoicingAddress eia ON el.Ex_InvoicingAddressID = eia.Ex_InvoicingAddressID
                WHERE el.Ex_InvoicingAddressID = @Ex_InvoicingAddressID
            `;

        // Si no es administrador, solo mostrar sus propios avisos
        if (!isAdministrator) {
            query += ` AND en.ExternalLoginID = @ExternalLoginID`;
            request.input('ExternalLoginID', sql.Int, externalLoginID);
        }

        query += ` ORDER BY nh.CreateDate DESC`;

        const result = await request.query(query);

        res.json({
            success: true,
            data: result.recordset,
            isAdmin: isAdministrator
        });

    } catch (error) {
        console.error('Error al obtener los avisos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los avisos',
            error: error.message
        });
    }
}

NoticesController.getAllNotices = async (req, res) => {
    try {
        const result = await sql.query(`
            SELECT DISTINCT
                    nh.NoticeHeaderID,
                    nh.CreateDate,
                    nh.ModifyDate,
                    nh.Observation,
                    nh.TechnicalObservation,
                    nh.StatusID,
                    nh.CustomerID,
                    nh.ApparatusID,
                    nh.BrandID,
                    nh.TypeID,
                    nh.ServiceTypeID,
                    c.Name as CustomerName,
                    c.Surname as CustomerSurname,
                    c.Address as CustomerAddress,
                    c.City as CustomerCity,
                    c.Phone as CustomerPhone,
                    c.Cell as CustomerCell,
                    a.Name as ApparatusName,
                    b.Name as BrandName,
                    t.Type as TypeName,
                    s.Name as StatusName,
                    en.ExternalLoginID,
                    en.Ex_StatusID,
                    el.Administrator,
                    eia.TaxName as CustomerTaxName
                FROM NoticeHeader nh
                JOIN Customers c ON nh.CustomerID = c.CustomerID
                JOIN Apparatus a ON nh.ApparatusID = a.ApparatusID
                JOIN Brands b ON nh.BrandID = b.BrandID
                LEFT JOIN Types t ON nh.TypeID = t.TypeID
                JOIN Status s ON nh.StatusID = s.StatusID
                JOIN Ex_Notices en ON nh.NoticeHeaderID = en.NoticeHeaderID
                JOIN Ex_Login el ON en.ExternalLoginID = el.ExternalLoginID
                JOIN Ex_InvoicingAddress eia ON el.Ex_InvoicingAddressID = eia.Ex_InvoicingAddressID
            WHERE nh.LeadSupplierID = 76
            ORDER BY nh.CreateDate DESC;
        `);

        res.json({
            success: true,
            data: result.recordset
        });

    }
    catch (error) {
        console.error('Error al obtener los avisos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los avisos',
            error: error.message
        });
    }
}
NoticesController.getCustomersByExternalLoginID = async (req, res) => {
    const { externalLoginID } = req.params;
    console.log("ExternalLoginID:", externalLoginID);

    try {
        const request = new sql.Request();
        request.input('ExternalLoginID', sql.VarChar, externalLoginID);

        const result = await request.query(`
            SELECT 
                CustomerID,
                Name,
                Surname,
                Address,
                City,
                ZipCode,
                Country,
                Phone,
                Cell,
                Email,
                CompanyID,
                InputDate,
                ModifiedOn,
                EnteredBy
            FROM Customers
            WHERE EnteredBy = @ExternalLoginID
            ORDER BY InputDate DESC;
        `);

        res.json(result.recordset);
    } catch (err) {
        console.error('Error al obtener los clientes:', err);
        res.status(500).json({
            error: 'Error al obtener los clientes',
            details: err.message
        });
    }
}

NoticesController.getEx_Status = async (req, res) => {
    try {
        const result = await sql.query(`SELECT * FROM Ex_Status ORDER BY Ex_StatusID`);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error al obtener los estados:', err);
        res.status(500).json({
            error: 'Error al obtener los estados',
            details: err.message
        });
    }
}

// Obtener todos los Ex_invoicingAddressID con CreateDate
NoticesController.getEx_InvoicingAddress = async (req, res) => {
    try {
        const result = await sql.query(`
            SELECT 
                i.*,
                (
                    SELECT TOP 1 l.CreateDate
                    FROM Ex_Login l
                    WHERE l.Ex_InvoicingAddressID = i.Ex_InvoicingAddressID
                    ORDER BY l.CreateDate DESC
                ) as CreateDate
            FROM Ex_InvoicingAddress i
            ORDER BY i.Ex_InvoicingAddressID
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error al obtener los Ex_InvoicingAddress:', err);
        res.status(500).json({
            error: 'Error al obtener los Ex_InvoicingAddress',
            details: err.message
        });
    }
}

NoticesController.get_Ex_PendingPayments = async (req, res) => {

    try {
        // const { Ex_InvoicingAddressID } = req.params;
        const result = await sql.query(`
            Select * from ex_GetPendingPayments
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error al obtener los pagos pendientes:', err);
        res.status(500).json({
            error: 'Error al obtener los pagos pendientes',
            details: err.message
        });
    }
}

NoticesController.getPendingPaymentDetails = async (req, res) => {
    try {
        const { invoicingAddressId, month, quincena } = req.query;
        
        if (!invoicingAddressId || !month || !quincena) {
            return res.status(400).json({
                success: false,
                message: 'Se requieren los parámetros invoicingAddressId, month y quincena'
            });
        }

        const query = `
            SELECT *
            FROM [Rapitecnic].[dbo].[ex_GetPendingPaymentsExtended] 
            WHERE Ex_InvoicingAddressID = @invoicingAddressId 
            AND MES = @month 
            AND QUINCENA = @quincena
        `;

        const request = new sql.Request();
        request.input('invoicingAddressId', sql.Int, parseInt(invoicingAddressId));
        request.input('month', sql.Int, parseInt(month));
        request.input('quincena', sql.Int, parseInt(quincena));

        const result = await request.query(query);

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        console.error('Error al obtener los detalles de pagos pendientes:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los detalles de pagos pendientes',
            error: error.message
        });
    }
};

NoticesController.deleteNotice = async (req, res) => {
    try {
        const { docEntry, timestamp, loginID } = req.body;
        
        if (!docEntry) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere el ID del aviso (docEntry)'
            });
        }
        
        // First check if the notice exists
        const checkQuery = `
            SELECT NoticeHeaderID, StatusID 
            FROM NoticeHeader 
            WHERE NoticeHeaderID = @docEntry
        `;
        
        const checkRequest = new sql.Request();
        checkRequest.input('docEntry', sql.Int, docEntry);
        const checkResult = await checkRequest.query(checkQuery);
        
        if (checkResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Aviso no encontrado'
            });
        }
        
        // Check if the notice can be deleted (only certain statuses)
        const notice = checkResult.recordset[0];
        const allowedStatuses = [1, 26]; // Example: pending, assigned
        
        if (!allowedStatuses.includes(notice.StatusID)) {
            return res.status(403).json({
                success: false,
                message: 'No se puede eliminar un aviso con este estado'
            });
        }
        
        // Delete the notice
        const deleteQuery = `
            -- First delete from Ex_Notices
            DELETE FROM Ex_Notices WHERE NoticeHeaderID = @docEntry;
            
            -- Then delete from NoticeHeader
            DELETE FROM NoticeHeader WHERE NoticeHeaderID = @docEntry;
            
            -- Log the deletion
            INSERT INTO NoticeLog (NoticeHeaderID, LoginID, LogDate, LogType, LogDescription)
            VALUES (@docEntry, @loginID, GETDATE(), 'DELETE', 'Aviso eliminado por usuario');
        `;
        
        const deleteRequest = new sql.Request();
        deleteRequest.input('docEntry', sql.Int, docEntry);
        deleteRequest.input('loginID', sql.Int, loginID);
        await deleteRequest.query(deleteQuery);
        
        res.json({
            success: true,
            message: 'Aviso eliminado correctamente'
        });
        
    } catch (error) {
        console.error('Error al eliminar el aviso:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el aviso',
            error: error.message
        });
    }
};

export default NoticesController;