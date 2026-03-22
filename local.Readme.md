Comando util para trasnformar todos os arquivos locais em txt
Get-ChildItem -File | Rename-Item -NewName { $_.BaseName + ".txt" }