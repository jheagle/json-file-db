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
<dt><a href="#create">create(recordName, definition, keys)</a> ⇒ <code>Promise</code></dt>
<dd><p>Create a new record.</p>
</dd>
<dt><a href="#record">record(properties)</a> ⇒ <code>recordDefinition</code></dt>
<dd></dd>
<dt><a href="#keyReference">keyReference(properties)</a> ⇒ <code>reference</code></dt>
<dd><p>Create a reference to a remote (foreign; existing on another record) key.</p>
</dd>
<dt><a href="#key">key(properties)</a> ⇒ <code>keyDefinition</code></dt>
<dd><p>Create a field key.</p>
</dd>
<dt><a href="#field">field(properties)</a> ⇒ <code>fieldDefinition</code></dt>
<dd><p>Generate a field for a record.</p>
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

<a name="create"></a>

## create(recordName, definition, keys) ⇒ <code>Promise</code>
Create a new record.

**Kind**: global function  

| Param | Type |
| --- | --- |
| recordName | <code>recordPath</code> | 
| definition | <code>Array.&lt;fieldProperties&gt;</code> | 
| keys | <code>Array.&lt;keyProperties&gt;</code> | 

<a name="record"></a>

## record(properties) ⇒ <code>recordDefinition</code>
**Kind**: global function  

| Param | Type |
| --- | --- |
| properties | <code>recordProperties</code> | 
| properties.path | <code>recordPath</code> | 
| properties.definition | <code>Array.&lt;fieldProperties&gt;</code> | 
| properties.keys | <code>Array.&lt;keyProperties&gt;</code> | 
| properties.entries | <code>Array.&lt;entityPath&gt;</code> | 

<a name="keyReference"></a>

## keyReference(properties) ⇒ <code>reference</code>
Create a reference to a remote (foreign; existing on another record) key.

**Kind**: global function  

| Param | Type |
| --- | --- |
| properties | <code>referenceProperties</code> | 
| properties.fields | <code>Array.&lt;fieldName&gt;</code> | 
| properties.lookup | <code>string</code> | 

<a name="key"></a>

## key(properties) ⇒ <code>keyDefinition</code>
Create a field key.

**Kind**: global function  

| Param | Type | Default |
| --- | --- | --- |
| properties | <code>keyProperties</code> |  | 
| [properties.type] | <code>string</code> | <code>&quot;&#x27;index&#x27;&quot;</code> | 
| [properties.fields] | <code>Array.&lt;fieldName&gt;</code> | <code>[]</code> | 
| [properties.lookup] | <code>string</code> | <code>&quot;&#x27;&#x27;&quot;</code> | 
| [properties.references] | <code>Array.&lt;reference&gt;</code> | <code>[]</code> | 

<a name="field"></a>

## field(properties) ⇒ <code>fieldDefinition</code>
Generate a field for a record.

**Kind**: global function  

| Param | Type | Default |
| --- | --- | --- |
| properties | <code>fieldProperties</code> |  | 
| [properties.name] | <code>string</code> | <code>&quot;&#x27;&#x27;&quot;</code> | 
| [properties.type] | <code>string</code> | <code>&quot;&#x27;string&#x27;&quot;</code> | 
| [properties.optional] | <code>boolean</code> | <code>false</code> | 
| [properties.useDefault] | <code>boolean</code> | <code>false</code> | 
| [properties.defaultValue] | <code>\*</code> | <code>&#x27;&#x27;</code> | 
| [properties.autoGenerate] | <code>boolean</code> | <code>false</code> | 

