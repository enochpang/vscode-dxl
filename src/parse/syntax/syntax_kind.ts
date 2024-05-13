export type SyntaxKind = TokenKind | NodeKind;

export const OTokenKind = {
	Lparen: "LPAREN",
	Rparen: "RPAREN",
	Lcurly: "LCURLY",
	Rcurly: "RCURLY",
	Lbracket: "LBRACKET",
	Rbracket: "RBRACKET",
	Semicolon: "SEMICOLON",
	Comma: "COMMA",
	Qmark: "QMARK",
	Tilde: "TILDE",
	Bslash: "BSLASH",
	Ampr: "AMPR",
	AmprEqual: "AMPREQUAL",
	AmprAmpr: "AMPRAMPR",
	Bang: "BANG",
	BangEqual: "BANGEQUAL",
	Bar: "BAR",
	BarEqual: "BAREQUAL",
	BarBar: "BARABR",
	Caret: "CARET",
	CaretCaret: "CARETCARET",
	CaretEqual: "CARETEQUAL",
	Colon: "COLON",
	ColonEqual: "COLONEQUAL",
	ColonColon: "COLONCOLON",
	Equal: "EQUAL",
	EqualEqual: "EQUALEQUAL",
	EqualGreat: "EQUALGREAT",
	FslashEqual: "FSLASHEQUAL",
	Fslash: "FSLASH",
	Great: "GREAT",
	GreatEqual: "GREATEQUAL",
	GreatGreat: "GREATGREAT",
	GreatGreatEqual: "GREATGREATEQUAL",
	Less: "LESS",
	LessEqual: "LESSEQUAL",
	LessGreat: "LESSGREAT",
	LessLess: "LESSLESS",
	LessLessEqual: "LESSLESSEQUAL",
	LessMinus: "LESSMINUS",
	Minus: "MINUS",
	MinusEqual: "MINUSEQUAL",
	MinusMinus: "MINUSMINUS",
	MinusGreat: "MINUSGREAT",
	Percent: "PERCENT",
	PercentEqual: "PERCENTEQUAL",
	Period: "PERIOD",
	PeriodPeriod: "PERIODPERIOD",
	Plus: "PLUS",
	PlusPlus: "PLUSPLUS",
	PlusEqual: "PLUSEQUAL",
	Star: "STAR",
	StarEqual: "STAREQUAL",

	KwAnd: "KWAND",
	KwBool: "KWBOOL",
	KwBreak: "KWBREAK",
	KwBy: "KWBY",
	KwCase: "KWCASE",
	KwChar: "KWCHAR",
	KwConst: "KWCONST",
	KwContinue: "KWCONTINUE",
	KwDefault: "KWDEFAULT",
	KwDo: "KWDO",
	KwElse: "KWELSE",
	KwEnum: "KWENUM",
	KwFalse: "KWFALSE",
	KwFor: "KWFOR",
	KwIf: "KWIF",
	KwIn: "KWIN",
	KwInclude: "KWINCLUDE",
	KwInt: "KWINT",
	KwModule: "KWMODULE",
	KwNull: "KWNULL",
	KwObject: "KWOBJECT",
	KwOr: "KWOR",
	KwPragma: "KWPRAGMA",
	KwReal: "KWREAL",
	KwReturn: "KWRETURN",
	KwSizeof: "KWSIZEOF",
	KwStatic: "KWSTATIC",
	KwString: "KWSTRING",
	KwStruct: "KWSTRUCT",
	KwSwitch: "KWSWITCH",
	KwThen: "KWTHEN",
	KwTrue: "KWTRUE",
	KwUnion: "KWUNION",
	KwVoid: "KWVOID",
	KwWhile: "KWWHILE",

	Comment: "COMMENT",
	String: "STRING",
	Integer: "INTEGER",
	Real: "REAL",
	Ident: "IDENT",
	Spaces: "SPACES",
	Tabs: "TABS",
	Eol: "EOL",
	Eof: "EOF",
	End: "END",
	LexError: "LEXERROR",
} as const;

/**
 * Represents the type of lex item
 */
export type TokenKind = (typeof OTokenKind)[keyof typeof OTokenKind];

export const OTreeKind = {
	TreeRoot: "TREEROOT",
	DxlPragma: "DXLPRAGMA",
	DxlInclude: "DXLINCLUDE",

	StmtArrayDecl: "STMTARRAYDECL",
	StmtBlock: "STMTBLOCK",
	StmtBreak: "STMTBREAK",
	StmtContinue: "STMTCONTINUE",
	StmtExpr: "STMTEXPR",
	StmtFor: "STMTFOR",
	StmtForIn: "STMTFORIN",
	StmtFuncDecl: "STMTFUNCDECL",
	StmtIf: "STMTIF",
	StmtReturn: "STMTJUMP",
	StmtVarDecl: "STMTVARDECL",
	StmtWhile: "STMTWHILE",
	ExprAssign: "EXPRASSIGN",
	ExprBinary: "EXPRBINARY",
	ExprCall: "EXPRCALL",
	ExprCast: "EXPRCAST",
	ExprCompare: "EXPRCOMPARE",
	ExprGet: "EXPRGET",
	ExprGrouping: "EXPRGROUPING",
	ExprIndex: "EXPRINDEX",
	ExprLiteral: "EXPRLITERAL",
	ExprLogical: "EXPRLOGICAL",
	ExprRange: "EXPRRANGE",
	ExprSet: "EXPRSET",
	ExprSetDbe: "EXPRSETDBE",
	ExprStringConcat: "EXPRSTRINGCONCAT",
	ExprTernary: "EXPRTERNARY",
	ExprUnary: "EXPRUNARY",
	ExprWrite: "EXPRWRITE",

	Null: "NULL",
	ParamList: "PARAMLIST",
	Param: "PARAM",
	ArgList: "ARGLIST",
	TypeAnnotation: "TYPEANNOTATION",
	NameRef: "NAMEREF",
	NameRefList: "NAMEREFLIST",
	ErrorNode: "ERRORNODE",
};

/**
 * Represents the type of syntax tree item
 */
export type NodeKind = (typeof OTreeKind)[keyof typeof OTreeKind];

export const BUILTIN_TYPES = new Set<string>([
	"_*",
	"_a",
	"_b",
	"_c",
	"_d",
	"_f",
	"_k",
	"_m",
	"_n",
	"_w",
	"_x",
	"_xr",
	"_xx",
	"_y",
	"AccessRec",
	"ADABool_",
	"ADADefault_",
	"ADAString_",
	"ADAType_",
	"ADMABool_",
	"ADMAString_",
	"AgentElement_",
	"AllAttrDef_",
	"AllAttrDefVal__",
	"AllAttrType_",
	"AllBaselineSet_",
	"AllBaselineSetDefinition_",
	"AllFolder_",
	"AllItem_",
	"AllModule_",
	"AllObj__",
	"AllObject_",
	"AllProject_",
	"AllRoot__",
	"AllView_",
	"AlternativeWord",
	"ArchiveData",
	"ArchiveInclusionDescriptor",
	"ArchiveItem",
	"ArchiveItemElementB_",
	"ArchiveItemElementS_",
	"ArchiveItemElementZ_",
	"Array",
	"ArraySect__",
	"Arrow__",
	"ATABaseType_",
	"ATABool_",
	"ATADesc_",
	"ATAEnumColour_",
	"ATAEnumColours_",
	"ATAEnumDesc_",
	"ATAEnumDescs_",
	"ATAEnumSize_",
	"ATAEnumString_",
	"ATAEnumStrings_",
	"ATAEnumValue_",
	"ATAEnumValues_",
	"ATAName_",
	"ATARangeValue_",
	"Attachment",
	"Attr__",
	"AttrBarsVal__",
	"AttrBaseType",
	"AttrDateVal__",
	"AttrDef",
	"AttrDef__",
	"AttrDefVal__",
	"AttrDescVal__",
	"AttrDxlVal__",
	"AttrHideVal__",
	"AttrHistVal__",
	"AttrInhVal__",
	"AttrLocaleVal__",
	"AttrMultiVal__",
	"AttrTop__",
	"AttrType",
	"AttrType__",
	"Baseline",
	"BaselineSet",
	"BaselineSetDefinition",
	"Before__",
	"Below__",
	"Binary__",
	"Bitmap",
	"Buffer",
	"Clipboard__",
	"ClipboardLock",
	"CMS_Message",
	"CMS_MessageConsumer",
	"Codepages__",
	"Column",
	"Comment",
	"CommentBool_",
	"CommentDate_",
	"CommentDiscussion_",
	"CommentModVer_",
	"CommentStatus_",
	"CommentString_",
	"CommentUser_",
	"ConfCachePolicy",
	"ConfDirectory__",
	"ConfStream",
	"ConfType",
	"ControlledResource__",
	"Database__",
	"Date",
	"DB",
	"DBE",
	"DbPropertiesCache",
	"DdcMode",
	"DebugVar",
	"DialogDefaults",
	"Dictionary",
	"Directory__",
	"DiscDate_",
	"DiscModVer_",
	"DiscStatus_",
	"DiscString_",
	"DiscUser_",
	"Discussion",
	"DiscussionFilter",
	"DiscussionFilterType",
	"DiscussionStatus",
	"DisplaySchemes",
	"Document__",
	"DOM_Document_",
	"DOM_Element_",
	"DropEvent",
	"DropEventBool_",
	"DropEventDBE_",
	"DropEventInt_",
	"DropEventString_",
	"DxlObject",
	"DxlObjectLHS",
	"EachInLinkRef__",
	"EmbeddedOleObject",
	"Entire__",
	"ExternalLink",
	"ExternalLinkBehaviour",
	"ExternalLinkDirection",
	"ExtLinkRef__",
	"Fattr_",
	"Filter",
	"FilteredLdapGroupListRef__",
	"FilteredLdapUserListRef__",
	"FilteredLdapUserRef__",
	"Folder",
	"FolderRef__",
	"Fonts__",
	"glueOn1__",
	"glueOn2__",
	"GrammarRules",
	"Group",
	"GroupElement_",
	"GroupList",
	"GroupRef__",
	"HABool_",
	"HADate_",
	"HAInt_",
	"HAString_",
	"HAType_",
	"HAValue_",
	"HeaderEvent",
	"History",
	"HistorySession",
	"HistoryType",
	"HttpBody",
	"HttpBody_",
	"HttpBodyInt_",
	"HttpBodyString_",
	"HttpHeader",
	"HttpHeader_",
	"HttpHeaderEntry",
	"HttpHeaderEntryString_",
	"HttpResponse",
	"HttpResponseBool_",
	"HttpResponseInt_",
	"HttpVerb",
	"Icon",
	"IconID",
	"InLinkRef__",
	"InPartition",
	"InPartString_",
	"InPlaceBox__",
	"InPlaceEditEvent",
	"IntegrityCheckItem",
	"IntegrityItemType",
	"IntegrityProblem",
	"IntegrityResultsData",
	"IPC",
	"Item",
	"Justification",
	"Language",
	"Languages__",
	"Last__",
	"LdapItem",
	"LdapItemList",
	"LdapItemString_",
	"Link",
	"LinkFilter",
	"LinkModuleDescriptor",
	"LinkRef",
	"Linkset",
	"Locale",
	"Locales__",
	"Lock",
	"LockElement_",
	"LockList",
	"LockRef__",
	"LoginPolicy",
	"LongDateFormats__",
	"MA_End__",
	"MA_StdCombo__",
	"MA_StdItem__",
	"MA_StdMenu__",
	"ModName_",
	"Module",
	"ModuleProperties",
	"ModuleRef__",
	"ModuleVersion",
	"MsgExt",
	"OAuthConsumer",
	"OAuthConsumerBool_",
	"OAuthConsumerString_",
	"Object",
	"ObjectRef__",
	"OleAutoArgs",
	"OleAutoObj",
	"OSLCCatalogServiceProvider",
	"OSLCCatalogServiceProviderString_",
	"OSLCLinkType",
	"OSLCLinkTypeBool_",
	"OSLCLinkTypeString_",
	"OSLCServer",
	"OSLCServerBool_",
	"OSLCServerString_",
	"OSLCServiceProvider",
	"OSLCServiceProviderDialog",
	"OSLCServiceProviderDialog_",
	"OSLCServiceProviderDialogBool_",
	"OSLCServiceProviderDialogInt_",
	"OSLCServiceProviderDialogs",
	"OSLCServiceProviderDialogs_",
	"OSLCServiceProviderDialogString_",
	"OSLCServiceProviderString_",
	"OutLinkRef__",
	"OutPartition",
	"OutPartString_",
	"PageLayout",
	"PageLayouts_",
	"PartAttrString_",
	"PartDefString_",
	"PartFileString_",
	"PartitionAttribute",
	"PartitionDefinition",
	"PartitionFile",
	"PartitionLinkset",
	"PartitionModule",
	"PartitionPermission",
	"PartitionView",
	"PartModString_",
	"PartViewString_",
	"Permission",
	"Picture__",
	"ProblemItem",
	"Project",
	"Range_",
	"RecentModule__",
	"Regexp",
	"ReservedName__",
	"RichText",
	"RichTextParagraph",
	"RifDefinition",
	"RifDefinitionBool_",
	"RifDefinitionProject_",
	"RifDefinitionString_",
	"RifExportPackage",
	"RifExportRecord",
	"RifExportRecordDate_",
	"RifExportRecordDef_",
	"RifExportRecordString_",
	"RifExportRecordUser_",
	"RifImport",
	"RifImportBool_",
	"RifImportDate_",
	"RifImportDef_",
	"RifImportFolder_",
	"RifImportFolderInfo",
	"RifImportFolderInfoString_",
	"RifImportModuleInfo",
	"RifImportModuleInfoString_",
	"RifImportPackage",
	"RifImportPackageString_",
	"RifImportUser_",
	"RifModuleDefinition",
	"RifModuleDefinitionBool_",
	"RifModuleDefinitionDdcMode_",
	"RifModuleDefinitionInt_",
	"RifModuleDefinitionString_",
	"RifModuleDefinitionVersion_",
	"Root__",
	"RowRef__",
	"RTF_buffer__",
	"RTF_buffer_No_Ole__",
	"RTF_buffer_With_Ole__",
	"RTF_string__",
	"RTFCharset_",
	"RTFEmbeddedOLE_",
	"RTFInt_",
	"RTFString_",
	"RTFText_",
	"Script__",
	"Scroll__",
	"ScrollDest__",
	"ScrollEvent",
	"ScrollSide",
	"ScrollUpDown__",
	"Sensitivity",
	"SessionModule_",
	"SessionObject_",
	"ShortDateFormats__",
	"Sibling__",
	"SignatureEntry",
	"SignatureInfo",
	"SignatureInfoSpecifier__",
	"Skip",
	"Sort",
	"SpellingAlternatives__",
	"SpellingError",
	"SpellingErrors__",
	"SpellingOptions",
	"Stat",
	"Stream",
	"Symbolic__",
	"TableBorderPosition",
	"TableBorderStyle",
	"TableRef__",
	"Template",
	"TemplateB__",
	"TokenReader",
	"TokenWriter",
	"ToolType",
	"trigEvent_",
	"Trigger",
	"TriggerStatus",
	"trigLevel_",
	"trigLevelDesc_",
	"trigLevelMod_",
	"trigType_",
	"User",
	"UserClass",
	"UserElement_",
	"UserList",
	"UserNotifyList",
	"UserRef__",
	"View",
	"ViewDef",
	"Views_",
	"Window__",
	"ZipType",
]);