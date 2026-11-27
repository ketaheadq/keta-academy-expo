import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, Filter, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useThemeColors } from '@/lib/theme';
import { cn, normalizeTurkish, parseCSVLine } from '@/lib/utils';

type ColumnType = 'text' | 'number' | 'badge';

interface ColumnInfo {
	key: string;
	label: string;
	type: ColumnType;
	index: number;
}

interface TableRow {
	id: number;
	cells: string[];
}

const FIRST_COLUMN_WIDTH = 200;
const COLUMN_WIDTH = 140;
const TABLE_BODY_HEIGHT = 384;

const ALL_PREFIX = 'Tüm ';

function stripQuotes(value: string): string {
	return value.replace(/^"(.*)"$/, '$1').trim();
}

function CellText({ value, column }: { value: string; column: ColumnInfo }) {
	if (!value) {
		return <Text className="text-muted-foreground text-sm">—</Text>;
	}
	if (column.type === 'badge') {
		return (
			<View className="self-start rounded-full border border-border bg-muted px-2 py-0.5">
				<Text className="font-medium text-muted-foreground text-xs">{value}</Text>
			</View>
		);
	}
	if (column.type === 'number') {
		if (value.toLowerCase() === 'dolmadı') {
			return (
				<View className="self-start rounded-full bg-warning/10 px-2 py-0.5">
					<Text className="font-semibold text-warning text-xs">Dolmadı</Text>
				</View>
			);
		}
		return (
			<Text className="font-medium text-foreground" style={{ fontFamily: 'monospace' }}>
				{value}
			</Text>
		);
	}
	return (
		<Text className="text-foreground text-sm" numberOfLines={2}>
			{value}
		</Text>
	);
}

export function AdmissionScoreTable({ title, csv }: { title: string; csv: string | null }) {
	const colors = useThemeColors();
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
	const [showFilters, setShowFilters] = useState(false);
	const [openFilter, setOpenFilter] = useState<string | null>(null);
	const [sortIndex, setSortIndex] = useState<number | null>(null);
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

	const { columns, rows, filterableColumns } = useMemo(() => {
		const empty = {
			columns: [] as ColumnInfo[],
			rows: [] as TableRow[],
			filterableColumns: [] as ColumnInfo[],
		};
		if (!csv) return empty;
		const lines = csv
			.trim()
			.split('\n')
			.filter((line) => line.trim() !== '');
		if (lines.length < 2) return empty;
		const headers = parseCSVLine(lines[0]);
		if (!headers) return empty;

		const columns: ColumnInfo[] = headers.map((header, index) => {
			const label = stripQuotes(header);
			const lowerHeader = label.toLowerCase();
			let type: ColumnType = 'text';
			if (
				lowerHeader.includes('puan') ||
				lowerHeader.includes('sıra') ||
				lowerHeader.includes('kontenjan') ||
				lowerHeader.includes('sayı')
			) {
				type = 'number';
			} else if (
				lowerHeader.includes('tür') ||
				lowerHeader.includes('type') ||
				lowerHeader.includes('kategori')
			) {
				type = 'badge';
			}
			return { key: `col_${index}`, label, type, index };
		});

		const rows: TableRow[] = [];
		lines.slice(1).forEach((line, id) => {
			const cells = parseCSVLine(line);
			if (!cells) return;
			rows.push({ id, cells: cells.map(stripQuotes) });
		});

		const filterableColumns = columns.filter((column) => {
			if (column.type !== 'text') return false;
			const unique = new Set(rows.map((row) => row.cells[column.index]).filter(Boolean));
			return unique.size > 1 && unique.size <= 50;
		});

		return { columns, rows, filterableColumns };
	}, [csv]);

	const filterOptions = useMemo(() => {
		const options: Record<string, string[]> = {};
		for (const column of filterableColumns) {
			const values = rows.map((row) => row.cells[column.index]).filter(Boolean);
			options[column.key] = [...new Set(values)].sort((a, b) =>
				normalizeTurkish(a).localeCompare(normalizeTurkish(b)),
			);
		}
		return options;
	}, [rows, filterableColumns]);

	const filteredRows = useMemo(() => {
		const term = normalizeTurkish(searchTerm.trim());
		const result = rows.filter((row) => {
			const matchesSearch =
				!term || row.cells.some((cell) => cell && normalizeTurkish(cell).includes(term));
			const matchesFilters = filterableColumns.every((column) => {
				const selected = selectedFilters[column.key];
				return (
					!selected ||
					selected === `${ALL_PREFIX}${column.label}` ||
					row.cells[column.index] === selected
				);
			});
			return matchesSearch && matchesFilters;
		});

		if (sortIndex !== null) {
			const column = columns[sortIndex];
			result.sort((a, b) => {
				const av = a.cells[sortIndex] ?? '';
				const bv = b.cells[sortIndex] ?? '';
				let cmp: number;
				if (column?.type === 'number') {
					const an = Number.parseFloat(av.replaceAll(/[",]/g, '')) || 0;
					const bn = Number.parseFloat(bv.replaceAll(/[",]/g, '')) || 0;
					cmp = an - bn;
				} else {
					cmp = normalizeTurkish(av).localeCompare(normalizeTurkish(bv));
				}
				return sortDirection === 'asc' ? cmp : -cmp;
			});
		}
		return result;
	}, [rows, columns, filterableColumns, selectedFilters, searchTerm, sortIndex, sortDirection]);

	const handleSort = (index: number) => {
		if (sortIndex === index) {
			setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
		} else {
			setSortIndex(index);
			setSortDirection('asc');
		}
	};

	const clearAllFilters = () => {
		setSelectedFilters({});
		setSearchTerm('');
		setSortIndex(null);
	};

	if (csv === null || rows.length === 0) {
		return null;
	}

	return (
		<View className="gap-4">
			<View className="flex-row items-center justify-between gap-3">
				<Text className="flex-1 font-bold text-foreground text-xl">{title} Detayları</Text>
				{filterableColumns.length > 0 ? (
					<Pressable
						accessibilityState={{ expanded: showFilters }}
						onPress={() => setShowFilters((prev) => !prev)}
						className={cn(
							'flex-row items-center gap-2 rounded-full border px-4 py-2.5 active:bg-muted',
							showFilters ? 'border-primary bg-accent' : 'border-input bg-card',
						)}
					>
						<Filter size={15} color={showFilters ? colors.primary : colors.foreground} />
						<Text
							className={cn(
								'font-semibold text-sm',
								showFilters ? 'text-primary' : 'text-foreground',
							)}
						>
							Filtreler
						</Text>
					</Pressable>
				) : null}
			</View>

			<View className="flex-row items-center gap-2 rounded-full border border-input bg-card px-4 py-2.5">
				<Search size={16} color={colors.mutedForeground} />
				<TextInput
					accessibilityLabel="Puan tablosunda ara"
					value={searchTerm}
					onChangeText={setSearchTerm}
					placeholder="Ara..."
					placeholderTextColor={colors.mutedForeground}
					className="flex-1 text-foreground text-sm"
				/>
			</View>

			{showFilters && filterableColumns.length > 0 ? (
				<View className="gap-4 rounded-2xl border border-border bg-card p-4">
					{filterableColumns.map((column) => {
						const allLabel = `${ALL_PREFIX}${column.label}`;
						const selected = selectedFilters[column.key] ?? allLabel;
						const isOpen = openFilter === column.key;
						return (
							<View key={column.key}>
								<Text className="mb-1.5 font-medium text-foreground text-sm">{column.label}</Text>
								<Pressable
									accessibilityState={{ expanded: isOpen }}
									onPress={() => setOpenFilter(isOpen ? null : column.key)}
									className="flex-row items-center justify-between rounded-xl border border-input bg-card px-3 py-2.5 active:bg-muted"
								>
									<Text className="flex-1 text-foreground text-sm" numberOfLines={1}>
										{selected}
									</Text>
									<ChevronDown size={16} color={colors.mutedForeground} />
								</Pressable>
								{isOpen ? (
									<ScrollView
										style={{ maxHeight: 176 }}
										className="mt-1 rounded-xl border border-input bg-card"
										nestedScrollEnabled
									>
										{[allLabel, ...(filterOptions[column.key] ?? [])].map((option) => (
											<Pressable
												key={option}
												onPress={() => {
													setSelectedFilters((prev) => ({ ...prev, [column.key]: option }));
													setOpenFilter(null);
												}}
												className={cn(
													'border-border border-b px-3 py-2.5 active:bg-muted',
													option === selected && 'bg-accent',
												)}
											>
												<Text
													className={cn(
														'text-sm',
														option === selected ? 'font-bold text-primary' : 'text-foreground',
													)}
													numberOfLines={1}
												>
													{option}
												</Text>
											</Pressable>
										))}
									</ScrollView>
								) : null}
							</View>
						);
					})}
					<Pressable onPress={clearAllFilters} className="self-start active:opacity-70">
						<Text className="font-semibold text-muted-foreground text-sm">Filtreleri Temizle</Text>
					</Pressable>
				</View>
			) : null}

			<Text className="text-muted-foreground text-sm">
				<Text className="font-semibold">{filteredRows.length}</Text> sonuç bulundu
				{filteredRows.length !== rows.length ? ` (toplam ${rows.length})` : ''}
			</Text>

			<View className="overflow-hidden rounded-xl border border-border bg-card">
				<ScrollView horizontal showsHorizontalScrollIndicator>
					<View>
						<View className="flex-row border-border border-b bg-muted">
							{columns.map((column) => (
								<Pressable
									key={column.key}
									onPress={() => handleSort(column.index)}
									style={{ width: column.index === 0 ? FIRST_COLUMN_WIDTH : COLUMN_WIDTH }}
									className="flex-row items-center gap-1 px-3 py-3 active:bg-accent"
								>
									<Text
										className="flex-1 font-semibold text-muted-foreground text-xs"
										numberOfLines={2}
									>
										{column.label}
									</Text>
									{sortIndex === column.index ? (
										sortDirection === 'asc' ? (
											<ArrowUp size={13} color={colors.primary} />
										) : (
											<ArrowDown size={13} color={colors.primary} />
										)
									) : (
										<ArrowUpDown size={13} color={colors.input} />
									)}
								</Pressable>
							))}
						</View>
						<FlatList
							data={filteredRows}
							keyExtractor={(row) => String(row.id)}
							style={{ height: TABLE_BODY_HEIGHT }}
							nestedScrollEnabled
							renderItem={({ item, index }) => (
								<View
									className={cn(
										'flex-row border-border border-b',
										index % 2 === 1 && 'bg-muted/60',
									)}
								>
									{columns.map((column) => (
										<View
											key={column.key}
											style={{ width: column.index === 0 ? FIRST_COLUMN_WIDTH : COLUMN_WIDTH }}
											className="justify-center px-3 py-3"
										>
											<CellText value={item.cells[column.index] ?? ''} column={column} />
										</View>
									))}
								</View>
							)}
							ListEmptyComponent={
								<View className="items-center justify-center py-16">
									<Text className="text-center text-muted-foreground text-sm">
										Sonuç bulunamadı. Arama kriterlerinizi değiştirin.
									</Text>
								</View>
							}
						/>
					</View>
				</ScrollView>
			</View>
		</View>
	);
}
