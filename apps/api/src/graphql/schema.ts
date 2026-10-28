export const typeDefs = /* GraphQL */ `
	enum Category {
		FLEUR
		BOUQUET
		VASE
		COFFRET
		HERBE
	}

	enum OrderStatus {
		NEW
		IN_PROGRESS
		READY
		DONE
		CANCELLED
	}

	type Product {
		id: ID!
		name: String!
		slug: String!
		category: Category!
		"Prix en centimes."
		priceCents: Int!
		stock: Int!
		description: String!
		imageUrl: String
		featured: Boolean!
		published: Boolean!
		position: Int!
		"Date ISO de la dernière modification (sitemap)."
		updatedAt: String!
	}

	type CustomOrder {
		id: ID!
		shape: String!
		color: String!
		mainFlower: String!
		secondaryFlower: String!
		greenery: String!
		customerName: String!
		email: String!
		phone: String!
		note: String!
		status: OrderStatus!
		createdAt: String!
	}

	type ContactMessage {
		id: ID!
		name: String!
		email: String!
		body: String!
		read: Boolean!
		createdAt: String!
	}

	type Stats {
		products: Int!
		"Produits publiés dont le stock est sous le seuil d'alerte."
		lowStock: Int!
		pendingOrders: Int!
		unreadMessages: Int!
	}

	type AuthPayload {
		token: String!
		email: String!
	}

	type Query {
		"Les produits non publiés ne sont renvoyés qu'à un admin connecté."
		products(category: Category, featured: Boolean, includeUnpublished: Boolean = false): [Product!]!
		"Produit publié, par son slug."
		product(slug: String!): Product
		"Admin uniquement."
		productById(id: ID!): Product
		"Admin uniquement."
		orders(status: OrderStatus): [CustomOrder!]!
		"Admin uniquement."
		messages: [ContactMessage!]!
		"Admin uniquement."
		stats: Stats!
		"E-mail de l'admin connecté, ou null."
		me: String
	}

	input ProductInput {
		name: String!
		"Généré depuis le nom s'il est vide."
		slug: String
		category: Category!
		priceCents: Int!
		stock: Int!
		description: String
		imageUrl: String
		featured: Boolean
		published: Boolean
		position: Int
	}

	input OrderInput {
		shape: String!
		color: String!
		mainFlower: String!
		secondaryFlower: String!
		greenery: String!
		customerName: String!
		email: String!
		phone: String
		note: String
	}

	input MessageInput {
		name: String!
		email: String!
		body: String!
	}

	type Mutation {
		login(email: String!, password: String!): AuthPayload!

		"Public : formulaire de contact. Limité par IP."
		sendMessage(input: MessageInput!): Boolean!
		"Public : bouquet sur mesure. Renvoie le numéro de commande. Limité par IP."
		createOrder(input: OrderInput!): ID!

		createProduct(input: ProductInput!): Product!
		updateProduct(id: ID!, input: ProductInput!): Product!
		deleteProduct(id: ID!): Boolean!
		"Ajoute (ou retire, si négatif) des unités au stock."
		restock(id: ID!, amount: Int!): Product!

		setOrderStatus(id: ID!, status: OrderStatus!): CustomOrder!
		deleteOrder(id: ID!): Boolean!

		setMessageRead(id: ID!, read: Boolean!): ContactMessage!
		deleteMessage(id: ID!): Boolean!
	}
`;
