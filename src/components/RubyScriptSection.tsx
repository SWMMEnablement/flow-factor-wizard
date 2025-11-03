import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download, FileCode } from "lucide-react";
import { toast } from "sonner";

const rubyScript = `# ============================================================================
# Peakable Flow Calculator for InfoWorks ICM to Approximate InfoSewer - COMPLETE VERSION
# ============================================================================

# ============================================================================
# CRITICAL: Load required libraries at the very top
# ============================================================================
begin
  require 'date'
  require 'csv'
rescue LoadError => e
  puts "ERROR: Could not load required library: #{e.message}"
  WSApplication.message_box(
    "ERROR: Missing required Ruby library\\n\\n#{e.message}",
    "OK",
    "!",
    false
  )
  exit
end

# Access the current open network
net = WSApplication.current_network

# Ensure a network is open
unless net
  WSApplication.message_box(
    "ERROR: No Network Open\\n\\n" +
    "Please open a network before running this script.",
    "OK",
    "!",
    false
  )
  exit
end

puts "\\n" + "="*80
puts " PEAKABLE FLOW CALCULATOR - ENHANCED VERSION 2.0"
puts " " + Time.now.strftime("%Y-%m-%d %H:%M:%S")
puts "="*80

# ============================================================================
# Clean up any existing transaction
# ============================================================================

puts "\\nChecking for existing transactions..."

begin
  net.transaction_commit
  puts "✓ Cleaned up previous transaction"
rescue => e
  puts "✓ No existing transaction to clean up"
end

# ============================================================================
# CONFIGURATION & FORMULA PRESETS
# ============================================================================

FORMULA_PRESETS = {
  'Harmon Formula' => {
    desc: 'EFF = 1 + (14 / sqrt(P)) - Traditional US formula',
    c1: 1.0, c2: 14.0, c3: 0.0, e1: 0.0, e2: 0.5, m1: 0.0, m2: 1.0
  },
  'Modified Harmon' => {
    desc: 'EFF = 1 + (18 / (4 + sqrt(P))) - Ten States Standards',
    c1: 1.0, c2: 18.0, c3: 4.0, e1: 0.0, e2: 0.5, m1: 0.0, m2: 1.0
  },
  'Babbitt Formula' => {
    desc: 'EFF = 5 / P^0.2 - For small communities',
    c1: 0.0, c2: 5.0, c3: 0.0, e1: 0.0, e2: 0.2, m1: 0.0, m2: 1.0
  },
  'Custom Formula' => {
    desc: 'Enter your own coefficients',
    c1: 1.0, c2: 14.0, c3: 0.0, e1: 0.0, e2: 0.5, m1: 0.0, m2: 1.0
  }
}

# ============================================================================
# STEP 1: Get user input
# ============================================================================

puts "\\nDisplaying parameter dialog..."

preset_options = FORMULA_PRESETS.keys

layout = [
  ['=== PEAKABLE FLOW CALCULATOR ===', 'READONLY', ''],
  ['', 'READONLY', ''],
  
  ['Formula Preset', 'String', 'Harmon Formula', nil, 'LIST', preset_options],
  ['', 'READONLY', ''],
  
  ['=== FLOW PARAMETERS ===', 'READONLY', ''],
  ['Flow per capita (L/person/day)', 'NUMBER', 200.0, 2],
  ['Convert to flow per second?', 'Boolean', true],
  ['Maximum EFF cutoff', 'NUMBER', 6.0, 2],
  ['', 'READONLY', ''],
  
  ['=== FORMULA COEFFICIENTS ===', 'READONLY', ''],
  ['c1 (constant term)', 'NUMBER', 1.0, 4],
  ['c2 (numerator constant)', 'NUMBER', 14.0, 4],
  ['c3 (denominator constant)', 'NUMBER', 0.0, 4],
  ['m1 (numerator multiplier)', 'NUMBER', 0.0, 4],
  ['m2 (denominator multiplier)', 'NUMBER', 1.0, 4],
  ['e1 (numerator exponent)', 'NUMBER', 0.0, 4],
  ['e2 (denominator exponent)', 'NUMBER', 0.5, 4],
  ['', 'READONLY', ''],
  
  ['=== OPTIONS ===', 'READONLY', ''],
  ['Dry run (calculate but don\\'t save)', 'Boolean', false],
  ['Export results to CSV', 'Boolean', true],
  ['Enable debug mode', 'Boolean', false]
]

result = WSApplication.prompt(
  'Peakable Flow Calculator - Enter Parameters',
  layout,
  false
)

if result.nil?
  puts "Calculation cancelled by user"
  exit
end

# Extract parameters
formula_preset = result[2]
q_per_capita = result[5]
convert_to_per_second = result[6]
cutoff = result[7]
c1 = result[10]
c2 = result[11]
c3 = result[12]
m1 = result[13]
m2 = result[14]
e1 = result[15]
e2 = result[16]
dry_run = result[19]
export_csv = result[20]
debug_mode = result[21]

# Apply formula preset
if formula_preset && formula_preset != 'Custom Formula' && FORMULA_PRESETS[formula_preset]
  preset = FORMULA_PRESETS[formula_preset]
  c1 = preset[:c1]
  c2 = preset[:c2]
  c3 = preset[:c3]
  m1 = preset[:m1]
  m2 = preset[:m2]
  e1 = preset[:e1]
  e2 = preset[:e2]
  
  puts "\\nApplied formula preset: #{formula_preset}"
  puts "  Description: #{preset[:desc]}"
end

# Convert flow units
q_per_capita_per_sec = convert_to_per_second ? (q_per_capita / 86400.0) : q_per_capita
flow_units = convert_to_per_second ? "L/s" : "L/day"

# ============================================================================
# PARAMETER VALIDATION
# ============================================================================

puts "\\n" + "-"*80
puts "VALIDATING PARAMETERS"
puts "-"*80

validation_errors = []
validation_warnings = []

if q_per_capita.nil? || q_per_capita <= 0
  validation_errors << "Flow per capita must be greater than 0"
end

if q_per_capita && q_per_capita < 50
  validation_warnings << "Flow per capita (#{q_per_capita} L/person/day) is unusually low"
elsif q_per_capita && q_per_capita > 1000
  validation_warnings << "Flow per capita (#{q_per_capita} L/person/day) is unusually high"
end

if cutoff.nil? || cutoff <= 0
  validation_errors << "Cutoff value must be greater than 0"
end

if cutoff && cutoff < 1.0
  validation_warnings << "Cutoff less than 1.0 may be too restrictive"
elsif cutoff && cutoff > 10.0
  validation_warnings << "Cutoff greater than 10.0 is unusually high"
end

if c3 == 0 && m2 == 0
  validation_errors << "c3 and m2 cannot both be zero (causes division by zero)"
end

if validation_warnings.size > 0
  puts "\\nWARNINGS:"
  validation_warnings.each { |w| puts "  ⚠ #{w}" }
end

if validation_errors.size > 0
  puts "\\nERRORS:"
  validation_errors.each { |e| puts "  ✗ #{e}" }
  
  WSApplication.message_box(
    "Parameter Validation Failed:\\n\\n" + validation_errors.join("\\n"),
    "OK",
    "!",
    false
  )
  exit
end

puts "\\n✓ Parameter validation passed"

# Display parameters
puts "\\n" + "-"*80
puts "CALCULATION PARAMETERS"
puts "-"*80
puts "Formula: #{formula_preset}"
puts "  EFF = c1 + ((c2 + (m1 * P^e1)) / (c3 + (m2 * P^e2)))"
puts "  c1=#{c1}, c2=#{c2}, c3=#{c3}"
puts "  m1=#{m1}, m2=#{m2}"
puts "  e1=#{e1}, e2=#{e2}"
puts ""
puts "Flow per capita: #{q_per_capita} L/person/day"
puts "  Converted to: #{q_per_capita_per_sec.round(6)} #{flow_units}"
puts "Maximum EFF cutoff: #{cutoff}"
puts ""
puts "Options:"
puts "  Dry run: #{dry_run ? 'YES (no changes will be saved)' : 'NO'}"
puts "  Export CSV: #{export_csv ? 'YES' : 'NO'}"
puts "  Debug mode: #{debug_mode ? 'YES' : 'NO'}"
puts "-"*80

# ============================================================================
# STEP 2: Build node-subcatchment mapping
# ============================================================================

puts "\\n" + "="*80
puts "PHASE 1: BUILDING NETWORK TOPOLOGY"
puts "="*80

puts "\\nMapping subcatchments to nodes..."

all_subs = net.row_object_collection('hw_subcatchment')
all_nodes = net.row_object_collection('hw_node')

node_sub_hash_map = Hash.new { |hash, key| hash[key] = [] }

all_nodes.each do |node|
  node_sub_hash_map[node.id] = []
end

sub_count = 0
subs_with_population = 0
total_population = 0.0
subs_without_connection = 0

all_subs.each do |sub|
  sub_count += 1
  
  has_connection = false
  
  if sub.node_id && !sub.node_id.empty?
    node_sub_hash_map[sub.node_id] << sub
    has_connection = true
  else
    begin
      sub.lateral_links.each do |link|
        if link.ds_node
          node_sub_hash_map[link.ds_node.id] ||= []
          node_sub_hash_map[link.ds_node.id] << sub
          has_connection = true
        end
      end
    rescue
    end
  end
  
  subs_without_connection += 1 unless has_connection
  
  if sub.population && sub.population > 0
    subs_with_population += 1
    total_population += sub.population
  end
end

puts "✓ Mapped #{sub_count} subcatchments"
puts "  With population: #{subs_with_population}"
puts "  Total population: #{total_population.round(0)}"
puts "  Not connected: #{subs_without_connection}" if subs_without_connection > 0

if subs_with_population == 0
  WSApplication.message_box(
    "ERROR: No subcatchments have population data!\\n\\n" +
    "Cannot calculate design flows without population.",
    "OK",
    "!",
    false
  )
  exit
end

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_conduit_flow_area(conduit)
  begin
    width = conduit.conduit_width
    height = conduit.conduit_height
    
    return 1.0 if width.nil? || width <= 0
    
    if !height.nil? && height > 0 && (height - width).abs > 0.001
      area = width * height
      return area > 0 ? area : 1.0
    else
      radius = width / 2.0
      area = Math::PI * radius * radius
      return area > 0 ? area : 1.0
    end
  rescue
    return 1.0
  end
end

$upstream_pop_cache = {}

def trace_upstream_population(conduit, node_sub_hash_map, debug_mode = false)
  conduit_id = conduit.id rescue nil
  return $upstream_pop_cache[conduit_id] if conduit_id && $upstream_pop_cache[conduit_id]
  
  unprocessed_links = [[conduit, 1.0]]
  seen_links = {}
  total_weighted_population = 0.0
  
  seen_links[conduit_id] = true if conduit_id
  
  max_iterations = 10000
  iteration_count = 0
  
  while unprocessed_links.size > 0 && iteration_count < max_iterations
    iteration_count += 1
    working_link, current_weight = unprocessed_links.shift
    
    begin
      us_node = working_link.us_node
    rescue
      next
    end
    
    next if us_node.nil?
    node_id = us_node.id rescue nil
    next if node_id.nil?
    
    adjusted_weight = current_weight
    
    downstream_conduits = []
    begin
      us_node.ds_links.each do |dl|
        downstream_conduits << dl if dl.table == 'hw_conduit'
      end
    rescue
    end
    
    if downstream_conduits.size > 1
      total_area = 0.0
      areas = {}
      
      downstream_conduits.each do |dc|
        area = get_conduit_flow_area(dc)
        dc_id = dc.id rescue nil
        areas[dc_id] = area if dc_id
        total_area += area
      end
      
      begin
        working_link_ds_node = working_link.ds_node
        working_link_ds_node_id = working_link_ds_node.id rescue nil
      rescue
        working_link_ds_node_id = nil
      end
      
      if working_link_ds_node_id && total_area > 0
        downstream_conduits.each do |dc|
          begin
            dc_ds_node = dc.ds_node
            dc_ds_node_id = dc_ds_node.id rescue nil
            
            if dc_ds_node_id == working_link_ds_node_id
              dc_id = dc.id rescue nil
              if dc_id && areas[dc_id]
                split_ratio = areas[dc_id] / total_area
                adjusted_weight = current_weight * split_ratio
                break
              end
            end
          rescue
          end
        end
      end
    end
    
    if node_sub_hash_map[node_id]
      node_sub_hash_map[node_id].each do |sub|
        if sub.population && sub.population > 0
          weighted_pop = sub.population * adjusted_weight
          total_weighted_population += weighted_pop
        end
      end
    end
    
    begin
      us_node.us_links.each do |ul|
        ul_id = ul.id rescue nil
        next if ul_id.nil? || seen_links[ul_id]
        
        unprocessed_links << [ul, adjusted_weight]
        seen_links[ul_id] = true
      end
    rescue
    end
  end
  
  $upstream_pop_cache[conduit_id] = total_weighted_population if conduit_id
  return total_weighted_population
end

# ============================================================================
# STEP 3: Calculate design flows
# ============================================================================

puts "\\n" + "="*80
puts "PHASE 2: CALCULATING PEAKABLE FLOWS"
puts "="*80

all_conduits = net.row_object_collection('hw_conduit')

total_conduits = 0
all_conduits.each { total_conduits += 1 }

puts "\\nProcessing #{total_conduits} conduits..."

results = []
processed = 0
updated = 0
skipped_no_pop = 0
errors = 0
eff_warnings = []

min_design_flow = Float::INFINITY
max_design_flow = 0.0
sum_design_flow = 0.0
sum_population = 0.0

transaction_started = false

unless dry_run
  begin
    net.transaction_begin
    transaction_started = true
    puts "✓ Transaction started"
  rescue => e
    puts "⚠ Could not start transaction: #{e.message}"
    
    begin
      net.transaction_rollback
    rescue
      begin
        net.transaction_commit
      rescue
      end
    end
    
    begin
      net.transaction_begin
      transaction_started = true
      puts "  ✓ Transaction started on retry"
    rescue => e2
      puts "  ⚠ Continuing without transaction"
    end
  end
end

begin
  all_conduits.each do |conduit|
    processed += 1
    
    if processed % 100 == 0 || (processed <= 10)
      percent = ((processed.to_f / total_conduits) * 100).round(1)
      puts "  Progress: #{processed}/#{total_conduits} (#{percent}%)" if total_conduits > 20
    end
    
    conduit_id = conduit.id rescue "UNKNOWN"
    
    begin
      population = trace_upstream_population(conduit, node_sub_hash_map, debug_mode)
      
      if population.nil? || population <= 0
        skipped_no_pop += 1
        next
      end
      
      if population.infinite? || population.nan?
        puts "  ✗ ERROR: Conduit #{conduit_id} - invalid population: #{population}"
        errors += 1
        next
      end
      
      p_to_e1 = population ** e1
      p_to_e2 = population ** e2
      numerator = c2 + (m1 * p_to_e1)
      denominator = c3 + (m2 * p_to_e2)
      
      if denominator.abs < 1e-10
        puts "  ✗ WARNING: Conduit #{conduit_id} - denominator near zero"
        next
      end
      
      eff = c1 + (numerator / denominator)
      
      if eff.infinite? || eff.nan?
        puts "  ✗ ERROR: Conduit #{conduit_id} - invalid EFF: #{eff}"
        errors += 1
        next
      end
      
      if eff < 0.5 && eff_warnings.size < 5
        eff_warnings << "Conduit #{conduit_id}: EFF=#{eff.round(3)} (unusually low)"
      elsif eff > 20.0 && eff_warnings.size < 5
        eff_warnings << "Conduit #{conduit_id}: EFF=#{eff.round(3)} (unusually high)"
      end
      
      eff_capped = eff > cutoff ? cutoff : eff
      design_flow = eff_capped * population * q_per_capita_per_sec
      
      if design_flow.infinite? || design_flow.nan? || design_flow < 0
        puts "  ✗ ERROR: Conduit #{conduit_id} - invalid design flow: #{design_flow}"
        errors += 1
        next
      end
      
      unless dry_run
        conduit.user_number_1 = design_flow
        conduit.write
      end
      
      min_design_flow = [min_design_flow, design_flow].min
      max_design_flow = [max_design_flow, design_flow].max
      sum_design_flow += design_flow
      sum_population += population
      
      results << {
        conduit_id: conduit_id,
        population: population,
        eff: eff,
        eff_capped: eff_capped,
        design_flow: design_flow
      }
      
      updated += 1
      
    rescue => e
      errors += 1
      puts "  ✗ ERROR: Conduit #{conduit_id} - #{e.message}"
    end
  end
  
  if transaction_started && !dry_run
    begin
      net.transaction_commit
      puts "\\n✓ Changes committed to network"
    rescue => e
      puts "\\n✗ Error committing transaction: #{e.message}"
    end
  elsif dry_run
    puts "\\n✓ Dry run complete - no changes made"
  else
    puts "\\n✓ Changes written directly"
  end
  
rescue => e
  if transaction_started
    begin
      net.transaction_rollback
      puts "\\n✗ Transaction rolled back due to error"
    rescue
    end
  end
  
  puts "\\n✗ FATAL ERROR: #{e.message}"
  
  WSApplication.message_box(
    "FATAL ERROR\\n\\n#{e.message}",
    "OK",
    "!",
    false
  )
  exit
end

# ============================================================================
# STEP 4: Display results
# ============================================================================

puts "\\n" + "="*80
puts "CALCULATION RESULTS"
puts "="*80

puts "\\nProcessing Summary:"
puts "  Total conduits: #{total_conduits}"
puts "  Successfully calculated: #{updated}"
puts "  Skipped (no population): #{skipped_no_pop}"
puts "  Errors: #{errors}"
puts "  Success rate: #{((updated.to_f / total_conduits) * 100).round(1)}%"

if updated > 0
  avg_design_flow = sum_design_flow / updated
  avg_population = sum_population / updated
  
  puts "\\nDesign Flow Statistics:"
  puts "  Minimum: #{min_design_flow.round(4)} #{flow_units}"
  puts "  Maximum: #{max_design_flow.round(4)} #{flow_units}"
  puts "  Average: #{avg_design_flow.round(4)} #{flow_units}"
  puts "  Total: #{sum_design_flow.round(2)} #{flow_units}"
  
  puts "\\nPopulation Statistics:"
  puts "  Average per conduit: #{avg_population.round(0)} people"
  puts "  Total contributing: #{sum_population.round(0)} people"
end

if eff_warnings.size > 0
  puts "\\n⚠ EFF Value Warnings:"
  eff_warnings.each { |w| puts "  #{w}" }
end

# ============================================================================
# STEP 5: Export to CSV
# ============================================================================

if export_csv && results.size > 0
  puts "\\n" + "-"*80
  puts "EXPORTING RESULTS TO CSV"
  puts "-"*80
  
  timestamp_str = Time.now.strftime("%Y%m%d_%H%M%S")
  filename = "design_flows_#{timestamp_str}.csv"
  
  documents_path = File.join(ENV['USERPROFILE'] || ENV['HOME'] || '', 'Documents')
  
  csv_paths_to_try = []
  
  if File.directory?(documents_path)
    csv_paths_to_try << File.join(documents_path, filename)
  end
  
  desktop_path = File.join(ENV['USERPROFILE'] || ENV['HOME'] || '', 'Desktop')
  if File.directory?(desktop_path)
    csv_paths_to_try << File.join(desktop_path, filename)
  end
  
  temp_path = ENV['TEMP'] || ENV['TMP'] || 'C:/Temp'
  if File.directory?(temp_path)
    csv_paths_to_try << File.join(temp_path, filename)
  end
  
  csv_saved = false
  final_path = nil
  
  csv_paths_to_try.each do |path|
    begin
      CSV.open(path, "wb") do |csv|
        csv << [
          "Conduit ID",
          "Contributing Population",
          "EFF (calculated)",
          "EFF (after cutoff)",
          "Design Flow (#{flow_units})"
        ]
        
        results.each do |row|
          csv << [
            row[:conduit_id],
            row[:population].round(2),
            row[:eff].round(4),
            row[:eff_capped].round(4),
            row[:design_flow].round(6)
          ]
        end
      end
      
      csv_saved = true
      final_path = path
      break
      
    rescue => e
      puts "  ⚠ Could not write to #{path}: #{e.message}"
      next
    end
  end
  
  if csv_saved
    puts "✓ Results exported successfully!"
    puts "  File: #{final_path}"
    puts "  Rows: #{results.size}"
    
    if RUBY_PLATFORM =~ /mswin|mingw|cygwin/
      begin
        system("explorer /select,\\"#{final_path.gsub('/', '\\\\\\\\')}\"")
      rescue
      end
    end
  else
    puts "✗ Could not save CSV file!"
    puts "\\nTried locations:"
    csv_paths_to_try.each { |p| puts "  - #{p}" }
  end
end

# ============================================================================
# STEP 6: Final summary
# ============================================================================

summary = "Peakable Flow Calculation Complete!\\n\\n"
summary += "Mode: #{dry_run ? 'DRY RUN' : 'LIVE RUN'}\\n\\n"
summary += "Results:\\n"
summary += "  Processed: #{processed}\\n"
summary += "  Updated: #{updated}\\n"
summary += "  Skipped: #{skipped_no_pop}\\n"
summary += "  Errors: #{errors}\\n\\n"

if updated > 0
  summary += "Peakable Flow Range:\n"
  summary += "  Min: #{min_design_flow.round(4)} #{flow_units}\n"
  summary += "  Max: #{max_design_flow.round(4)} #{flow_units}\n"
  summary += "  Avg: #{(sum_design_flow / updated).round(4)} #{flow_units}\n\n"
end

summary += "Formula: #{formula_preset}\\n"
summary += "Q per capita: #{q_per_capita} L/person/day\\n"
summary += "Stored in: user_number_1\\n"
summary += "Units: #{flow_units}"

WSApplication.message_box(
  summary,
  "OK",
  "Information",
  false
)

puts "\\n" + "="*80
puts "SCRIPT COMPLETE"
puts "="*80`;

const RubyScriptSection = () => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(rubyScript);
    toast.success("Ruby script copied to clipboard!");
  };

  const downloadScript = () => {
    const blob = new Blob([rubyScript], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'infoworks_icm_peakable_flow_approximate_infosewer.rb';
    a.click();
    toast.success("Ruby script downloaded!");
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-primary/20">
        <CardHeader>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-3xl flex items-center gap-2">
                <FileCode className="h-8 w-8 text-primary" />
                InfoWorks ICM Ruby Script
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Ruby script for peakable flows to approximate InfoSewer in InfoWorks ICM
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={copyToClipboard} variant="outline">
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
              <Button onClick={downloadScript}>
                <Download className="mr-2 h-4 w-4" />
                Download .rb
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-accent/10 border-l-4 border-accent p-4 rounded">
            <h4 className="font-semibold mb-2 flex items-center gap-2 text-accent">
              <FileCode className="h-5 w-5" />
              How to Use This Script
            </h4>
            <ol className="space-y-2 text-sm text-foreground/80 ml-4 list-decimal">
              <li>Open InfoWorks ICM and load your network model</li>
              <li>Go to <strong>Network → Run Ruby Script</strong></li>
              <li>Either paste the script or load the downloaded .rb file</li>
              <li>Configure parameters in the dialog (formula, flow per capita, cutoff)</li>
              <li>Run the script - it will calculate steady state peakable flows in user_number_1 field</li>
              <li>Results approximate InfoSewer methodology and export to CSV (if enabled)</li>
            </ol>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-muted/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground">Features</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <div>✓ Upstream population tracing</div>
                <div>✓ Flow split calculations</div>
                <div>✓ Multiple formula presets</div>
                <div>✓ CSV export functionality</div>
                <div>✓ Transaction management</div>
              </CardContent>
            </Card>

            <Card className="bg-muted/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground">Requirements</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <div>• InfoWorks ICM (any version)</div>
                <div>• Network with population data</div>
                <div>• Subcatchments connected to nodes</div>
                <div>• Ruby libraries: date, csv</div>
              </CardContent>
            </Card>

            <Card className="bg-muted/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground">Output</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <div>• Stored in: user_number_1</div>
                <div>• CSV file with all results</div>
                <div>• Console log with statistics</div>
                <div>• Summary message box</div>
              </CardContent>
            </Card>
          </div>

          <div className="relative">
            <pre className="bg-muted border border-border rounded-lg p-4 overflow-x-auto text-xs font-mono max-h-[600px] overflow-y-auto">
              <code className="text-foreground">{rubyScript}</code>
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Script Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-foreground/80">
          <div>
            <h4 className="font-semibold text-foreground mb-2">What This Script Does:</h4>
            <ul className="space-y-2 ml-4 list-disc">
              <li><strong>Network Analysis:</strong> Traces upstream through the pipe network to calculate contributing population for each conduit</li>
              <li><strong>Flow Splitting:</strong> Handles junctions with multiple downstream pipes by proportioning population based on cross-sectional areas</li>
              <li><strong>Peaking Factors:</strong> Calculates EFF (peaking factors) using configurable formulas (Harmon, Modified Harmon, Babbitt, or custom)</li>
              <li><strong>Peakable Flows:</strong> Computes design flows as: Q<sub>peakable</sub> = EFF × Population × Q<sub>per capita</sub></li>
              <li><strong>Data Storage:</strong> Writes calculated peakable flows directly to the conduit's user_number_1 field for use in hydraulic modeling</li>
              <li><strong>Export:</strong> Generates comprehensive CSV reports with all calculation results and statistics</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Key Features:</h4>
            <ul className="space-y-2 ml-4 list-disc">
              <li><strong>Validation:</strong> Comprehensive parameter validation with warnings for unusual values</li>
              <li><strong>Error Handling:</strong> Robust error handling with transaction rollback on failures</li>
              <li><strong>Performance:</strong> Upstream population caching for efficient repeated calculations</li>
              <li><strong>Dry Run Mode:</strong> Test calculations without modifying the network</li>
              <li><strong>Progress Tracking:</strong> Real-time progress updates for large networks</li>
              <li><strong>Debug Mode:</strong> Additional logging for troubleshooting</li>
            </ul>
          </div>

          <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
            <h4 className="font-semibold text-primary mb-2">Pro Tip:</h4>
            <p>Run the script in <strong>dry run mode</strong> first to validate your parameters and see results without modifying your network. This allows you to verify calculations before committing changes to your model.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RubyScriptSection;
