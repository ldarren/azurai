<form id="agent-form">
  <div class="form-group">
    <label for="id">ID:</label>
    <input type="text" id="id" name="id" maxlength="16" value="<%d.id%>">
    <div class="error-message" id="id-error"></div>
  </div>
  <div class="form-group">
    <label for="name">Name:</label>
    <input type="text" id="name" name="name" maxlength="32" value="<%d.name%>">
    <div class="error-message" id="name-error"></div>
  </div>
  <div class="form-group">
    <label for="summary">Summary:</label>
    <textarea id="summary" name="summary"><%d.summary%></textarea>
    <div class="error-message" id="summary-error"></div>
  </div>
  <div class="form-group">
    <label for="params">Params (JSON):</label>
    <textarea id="params" name="params"><%JSON.stringify(d.params, null, '\t')%></textarea>
    <div class="error-message" id="params-error"></div>
  </div>
  <div class="form-group">
    <label for="persona">Persona:</label>
    <textarea id="persona" name="persona"><%d.persona%></textarea>
    <div class="error-message" id="persona-error"></div>
  </div>
</form>