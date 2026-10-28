import {
	GraphQLError,
	Kind,
	type ASTVisitor,
	type FragmentDefinitionNode,
	type SelectionSetNode,
	type ValidationContext
} from 'graphql';

export interface QueryLimits {
	maxDepth: number;
	/** Nombre total de champs demandés (fragments dépliés). */
	maxFields: number;
	/** Les alias permettent d'appeler N fois la même mutation dans une seule requête. */
	maxAliases: number;
}

/** Règle de validation GraphQL : rejette les requêtes trop profondes, trop larges ou trop aliasées. */
export function queryLimitsRule(limits: QueryLimits) {
	return (context: ValidationContext): ASTVisitor => {
		const fragments = new Map<string, FragmentDefinitionNode>();
		for (const def of context.getDocument().definitions) {
			if (def.kind === Kind.FRAGMENT_DEFINITION) fragments.set(def.name.value, def);
		}

		return {
			OperationDefinition(node) {
				let fields = 0;
				let aliases = 0;
				let depth = 0;

				const walk = (set: SelectionSetNode, level: number, visited: ReadonlySet<string>) => {
					depth = Math.max(depth, level);
					for (const selection of set.selections) {
						if (selection.kind === Kind.FIELD) {
							fields++;
							if (selection.alias) aliases++;
							if (selection.selectionSet) walk(selection.selectionSet, level + 1, visited);
						} else if (selection.kind === Kind.INLINE_FRAGMENT) {
							walk(selection.selectionSet, level, visited);
						} else {
							const name = selection.name.value;
							const fragment = fragments.get(name);
							if (fragment && !visited.has(name)) {
								walk(fragment.selectionSet, level, new Set([...visited, name]));
							}
						}
					}
				};
				walk(node.selectionSet, 1, new Set());

				const report = (message: string) =>
					context.reportError(new GraphQLError(message, { nodes: [node] }));
				if (depth > limits.maxDepth) report(`Requête trop profonde (max ${limits.maxDepth})`);
				if (fields > limits.maxFields) report(`Requête trop volumineuse (max ${limits.maxFields} champs)`);
				if (aliases > limits.maxAliases) report(`Trop d'alias (max ${limits.maxAliases})`);
			}
		};
	};
}
