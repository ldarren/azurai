<%if (d.checked) {%>
    <input type="checkbox" id="<%d.id%>" name="<%d.node_id%>" checked/>
<%}else{%>
    <input type="checkbox" id="<%d.id%>" name="<%d.node_id%>"/>
<%}%>
<label for="<%d.id%>"><%d.full_name%></label>