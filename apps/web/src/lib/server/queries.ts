const PRODUCT_FIELDS = `
	id name slug category priceCents stock description imageUrl featured published position updatedAt
`;

const ORDER_FIELDS = `
	id shape color mainFlower secondaryFlower greenery customerName email phone note status createdAt
`;

const MESSAGE_FIELDS = `id name email body read createdAt`;

// Site public

export const HOME_QUERY = `query Home { products(featured: true) { ${PRODUCT_FIELDS} } }`;

export const CATALOGUE_QUERY = `
	query Catalogue($category: Category) { products(category: $category) { ${PRODUCT_FIELDS} } }
`;

export const PRODUCT_QUERY = `
	query Product($slug: String!) {
		product(slug: $slug) { ${PRODUCT_FIELDS} }
		products { ${PRODUCT_FIELDS} }
	}
`;

export const SITEMAP_QUERY = `query Sitemap { products { slug updatedAt } }`;

export const SEND_MESSAGE = `
	mutation SendMessage($input: MessageInput!) { sendMessage(input: $input) }
`;

export const CREATE_ORDER = `mutation CreateOrder($input: OrderInput!) { createOrder(input: $input) }`;

// Back office

export const LOGIN = `
	mutation Login($email: String!, $password: String!) { login(email: $email, password: $password) { token } }
`;

export const ME = `query Me { me }`;

export const DASHBOARD_QUERY = `
	query Dashboard {
		stats { products lowStock pendingOrders unreadMessages }
		orders { ${ORDER_FIELDS} }
		messages { ${MESSAGE_FIELDS} }
		products(includeUnpublished: true) { ${PRODUCT_FIELDS} }
	}
`;

export const ADMIN_PRODUCTS = `
	query AdminProducts { products(includeUnpublished: true) { ${PRODUCT_FIELDS} } }
`;

export const ADMIN_PRODUCT = `query AdminProduct($id: ID!) { productById(id: $id) { ${PRODUCT_FIELDS} } }`;

export const CREATE_PRODUCT = `
	mutation CreateProduct($input: ProductInput!) { createProduct(input: $input) { id } }
`;

export const UPDATE_PRODUCT = `
	mutation UpdateProduct($id: ID!, $input: ProductInput!) { updateProduct(id: $id, input: $input) { id } }
`;

export const DELETE_PRODUCT = `mutation DeleteProduct($id: ID!) { deleteProduct(id: $id) }`;

export const RESTOCK = `
	mutation Restock($id: ID!, $amount: Int!) { restock(id: $id, amount: $amount) { id name stock } }
`;

export const ORDERS_QUERY = `query Orders { orders { ${ORDER_FIELDS} } }`;

export const SET_ORDER_STATUS = `
	mutation SetOrderStatus($id: ID!, $status: OrderStatus!) { setOrderStatus(id: $id, status: $status) { id } }
`;

export const DELETE_ORDER = `mutation DeleteOrder($id: ID!) { deleteOrder(id: $id) }`;

export const MESSAGES_QUERY = `query Messages { messages { ${MESSAGE_FIELDS} } }`;

export const SET_MESSAGE_READ = `
	mutation SetMessageRead($id: ID!, $read: Boolean!) { setMessageRead(id: $id, read: $read) { id } }
`;

export const DELETE_MESSAGE = `mutation DeleteMessage($id: ID!) { deleteMessage(id: $id) }`;
