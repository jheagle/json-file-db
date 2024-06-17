# josn-file-db
Read and manage data with JSON files.
## Functions

<dl>
<dt><a href="#parseQuery">parseQuery(query)</a> ⇒ <code>ParsedQuery</code></dt>
<dd><p>Break a query down into its components.</p>
</dd>
<dt><a href="#findSortClauses">findSortClauses(parsed, query)</a> ⇒ <code>string</code></dt>
<dd><p>Extract sort clauses from the query.</p>
</dd>
<dt><a href="#findSelects">findSelects(parsed, query)</a> ⇒ <code>string</code></dt>
<dd><p>Extract select clauses from the query.</p>
</dd>
<dt><a href="#findOffset">findOffset(parsed, query)</a> ⇒ <code>string</code></dt>
<dd><p>Extract the offset clauses from the query.</p>
</dd>
<dt><a href="#findMergeJoins">findMergeJoins(parsed, query)</a> ⇒ <code>string</code></dt>
<dd><p>Extract merge-join clauses from the query.</p>
</dd>
<dt><a href="#findLimit">findLimit(parsed, query)</a> ⇒ <code>string</code></dt>
<dd><p>Extract the limit clauses from the query.</p>
</dd>
<dt><a href="#findJoinEntity">findJoinEntity(parsed, query)</a> ⇒ <code>string</code></dt>
<dd><p>Extract the main join entity from the query.</p>
</dd>
<dt><a href="#findJoinClauses">findJoinClauses(parsed, query)</a> ⇒ <code>string</code></dt>
<dd><p>Extract condition clauses from the query.</p>
</dd>
<dt><a href="#findGroupBy">findGroupBy(parsed, query)</a> ⇒ <code>string</code></dt>
<dd><p>Extract the group by clauses from the query.</p>
</dd>
<dt><a href="#findConditions">findConditions(parsed, query)</a> ⇒ <code>string</code></dt>
<dd><p>Extract condition clauses from the query.</p>
</dd>
<dt><a href="#findCommand">findCommand(parsed, query)</a> ⇒ <code>string</code></dt>
<dd><p>Extract command clauses from the query.</p>
</dd>
</dl>

<a name="parseQuery"></a>

## parseQuery(query) ⇒ <code>ParsedQuery</code>
Break a query down into its components.

**Kind**: global function  

| Param | Type |
| --- | --- |
| query | <code>string</code> | 

<a name="findSortClauses"></a>

## findSortClauses(parsed, query) ⇒ <code>string</code>
Extract sort clauses from the query.

**Kind**: global function  

| Param | Type |
| --- | --- |
| parsed | <code>ParsedQuery</code> | 
| query | <code>string</code> | 

<a name="findSelects"></a>

## findSelects(parsed, query) ⇒ <code>string</code>
Extract select clauses from the query.

**Kind**: global function  

| Param | Type |
| --- | --- |
| parsed | <code>ParsedQuery</code> | 
| query | <code>string</code> | 

<a name="findOffset"></a>

## findOffset(parsed, query) ⇒ <code>string</code>
Extract the offset clauses from the query.

**Kind**: global function  

| Param | Type |
| --- | --- |
| parsed | <code>ParsedQuery</code> | 
| query | <code>string</code> | 

<a name="findMergeJoins"></a>

## findMergeJoins(parsed, query) ⇒ <code>string</code>
Extract merge-join clauses from the query.

**Kind**: global function  

| Param | Type |
| --- | --- |
| parsed | <code>ParsedQuery</code> | 
| query | <code>string</code> | 

<a name="findLimit"></a>

## findLimit(parsed, query) ⇒ <code>string</code>
Extract the limit clauses from the query.

**Kind**: global function  

| Param | Type |
| --- | --- |
| parsed | <code>ParsedQuery</code> | 
| query | <code>string</code> | 

<a name="findJoinEntity"></a>

## findJoinEntity(parsed, query) ⇒ <code>string</code>
Extract the main join entity from the query.

**Kind**: global function  

| Param | Type |
| --- | --- |
| parsed | <code>ParsedQuery</code> | 
| query | <code>string</code> | 

<a name="findJoinClauses"></a>

## findJoinClauses(parsed, query) ⇒ <code>string</code>
Extract condition clauses from the query.

**Kind**: global function  

| Param | Type |
| --- | --- |
| parsed | <code>ParsedQuery</code> | 
| query | <code>string</code> | 

<a name="findGroupBy"></a>

## findGroupBy(parsed, query) ⇒ <code>string</code>
Extract the group by clauses from the query.

**Kind**: global function  

| Param | Type |
| --- | --- |
| parsed | <code>ParsedQuery</code> | 
| query | <code>string</code> | 

<a name="findConditions"></a>

## findConditions(parsed, query) ⇒ <code>string</code>
Extract condition clauses from the query.

**Kind**: global function  

| Param | Type |
| --- | --- |
| parsed | <code>ParsedQuery</code> | 
| query | <code>string</code> | 

<a name="findCommand"></a>

## findCommand(parsed, query) ⇒ <code>string</code>
Extract command clauses from the query.

**Kind**: global function  

| Param | Type |
| --- | --- |
| parsed | <code>ParsedQuery</code> | 
| query | <code>string</code> | 

